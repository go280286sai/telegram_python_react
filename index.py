import json
import os
from fastapi import FastAPI, HTTPException
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from telethon import TelegramClient
from dotenv import load_dotenv
from pydantic import BaseModel
import aiosqlite
import hashlib

load_dotenv()

app = FastAPI()

DATABASE_URL = os.getenv("DATABASE_URL")
origins = [
    "http://127.0.0.1:3000",
    "http://192.168.50.70:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_id = int(os.getenv('API_ID'))
api_hash = os.getenv('API_HASH')
deep_limit = int(os.getenv('DEEP_LIMIT'))
client = TelegramClient('anon', api_id, api_hash)
my_groups = []
my_id = []
authorized = {"status": False, "token": None}


class Message(BaseModel):
    group_id: str
    message: str


class Setting(BaseModel):
    name: str
    value: str


class User(BaseModel):
    name: str
    id: int


class Posts(BaseModel):
    description: str
    id: int


class RemovedUser(BaseModel):
    target: str


class RemovedPost(BaseModel):
    target: str


class Register(BaseModel):
    email: str
    password: str


async def register(email: str, password: str):
    user_email = hashlib.sha256(os.getenv("USER_EMAIL").encode("utf-8")).hexdigest()
    user_password = hashlib.sha256(os.getenv("USER_PASSWORD").encode("utf-8")).hexdigest()
    email = hashlib.sha256(email.encode("utf-8")).hexdigest()
    password = hashlib.sha256(password.encode("utf-8")).hexdigest()
    if user_email == email and user_password == password:
        authorized["status"] = True
        authorized["token"] = await token_generator()
        return [{"status": True, "token": authorized["token"]}]
    else:
        return [{"status": False}]


async def token_generator():
    token = os.urandom(16)
    token = hashlib.sha256(token).hexdigest()
    return token


async def is_user_authorized(token: str):
    if authorized["token"] == token and authorized["status"]:
        return {"status": authorized["status"]}
    return [{"status": False}]


async def logout():
    authorized["status"] = False
    authorized["token"] = None
    return [{"status": True}]


async def main():
    client.start()
    me = await client.get_me()
    my_id.append(me.id)
    i = 0
    async for dialog in client.iter_dialogs():
        my_groups.append({'index': i, 'name': dialog.name, 'id': dialog.id})
        i += 1
    return my_groups


async def process_messages(group_id, limit=deep_limit, search_query=None):
    messages = []
    users = {}
    async for message in client.iter_messages(group_id, limit=limit, search=search_query):
        if message.sender_id not in users:
            user = await get_user(message.sender_id)
            users[message.sender_id] = user
        else:
            user = users[message.sender_id]
        messages.append({
            'chat_id': message.chat.id,
            'message_id': message.id,
            'message': message.message,
            'date': message.date,
            'sender_id': message.sender_id,
            'user': user
        })
    return messages


async def get_messages(group_id):
    return await process_messages(group_id, limit=deep_limit)


async def get_search_messages(search_query):
    messages = []
    groups = await main()
    for group in groups:
        group_messages = await process_messages(group['id'], limit=deep_limit, search_query=search_query)
        messages.extend(group_messages)
    return messages


async def get_user(user_id):
    try:
        user = await client.get_entity(user_id)
        if user_id < 0:
            return {'name': user.title}
        else:
            return {'name': user.first_name, 'username': user.username, 'phone': user.phone,
                    'last_name': user.last_name}
    except Exception as e:
        print(e)


async def send_message(group_id, message):
    client.parse_mode = 'html'
    await client.send_message(group_id, message)
    return [{'status': 'ok'}]


async def download_json(file_path: str):
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='application/octet-stream', filename="clients.json")
    else:
        raise HTTPException(status_code=404, detail="File not found")


async def init_db():
    async with aiosqlite.connect(DATABASE_URL) as db:
        await db.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)')
        await db.execute('CREATE TABLE IF NOT EXISTS settings (name TEXT PRIMARY KEY, value TEXT)')
        await db.execute('CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY, description TEXT)')
        await db.commit()


@app.post('/register')
async def register_user(req: Register):
    try:
        result = await register(req.email, req.password)
        return result
    except Exception as e:
        print(e)
        return [{"status": False}]


@app.get("/is_authorized/{token}")
async def is_authorized(token: str):
    try:
        result = await is_user_authorized(token)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/logout/{token}")
async def set_logout(token: str):
    try:
        if token != authorized["token"]:
            raise HTTPException(status_code=401, detail="Unauthorized")
        return await logout()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/get_groups/{token}")
async def get_groups(token: str):
    try:
        if token != authorized["token"]:
            raise HTTPException(status_code=401, detail="Unauthorized")
        return await main()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/get_messages/{group_id}/{token}")
async def fetch_messages(group_id: str, token: str):
    try:
        if token != authorized["token"]:
            raise HTTPException(status_code=401, detail="Unauthorized")
        group_id = int(group_id)
        return await get_messages(group_id)
    except Exception as e:
        raise (HTTPException(status_code=500, detail=str(e)))


@app.post("/send_message")
async def fetch_messages(req: Message):
    try:
        group_id = int(req.group_id)
        message = req.message
        messages = await send_message(group_id, message)
        return messages
    except Exception as e:
        raise (HTTPException(status_code=500, detail=str(e)))


@app.get("/get_search/{search_query}/{token}")
async def search_messages(search_query: str, token: str):
    try:
        if token != authorized["token"]:
            raise HTTPException(status_code=401, detail="Unauthorized")
        return await get_search_messages(search_query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/get_post/{post_id}/{token}")
async def fetch_post(post_id: int, token: str):
    try:
        if token != authorized["token"]:
            raise HTTPException(status_code=401, detail="Unauthorized")
        return await get_user(post_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/posts/{token}")
async def read_posts(token: str):
    if token != authorized["token"]:
        raise HTTPException(status_code=401, detail="Unauthorized")
    async with aiosqlite.connect(DATABASE_URL) as db:
        cursor = await db.execute('SELECT * FROM posts')
        rows = await cursor.fetchall()
        column_names = [description[0] for description in cursor.description]
        return [dict(zip(column_names, row)) for row in rows]


@app.post("/posts")
async def write_posts(post: Posts):
    async with aiosqlite.connect(DATABASE_URL) as db:
        try:
            await db.execute('INSERT INTO posts (description, id) VALUES (?, ?)', (post.description, post.id))
            await db.commit()
        except aiosqlite.IntegrityError:
            raise HTTPException(status_code=400, detail="post already exists")
    return [{"status": "ok"}]


@app.delete("/posts/{ids}")
async def delete_post(ids: int):
    async with aiosqlite.connect(DATABASE_URL) as db:
        cursor = await db.execute('DELETE FROM posts WHERE id = ?', (ids,))
        await db.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Post not found")
    return [{"status": "ok"}]


@app.post("/posts/remove")
async def remove_posts(post: RemovedPost):
    async with aiosqlite.connect(DATABASE_URL) as db:
        try:
            if post.target == 'all':
                await db.execute('DELETE FROM posts')
                await db.commit()
        except aiosqlite.IntegrityError:
            raise HTTPException(status_code=400, detail="post already exists")
    return [{"status": "ok"}]


@app.post("/settings/")
async def create_setting(setting: Setting):
    async with aiosqlite.connect(DATABASE_URL) as db:
        try:
            await db.execute('INSERT INTO settings (name, value) VALUES (?, ?)', (setting.name, setting.value))
            await db.commit()
        except aiosqlite.IntegrityError:
            raise HTTPException(status_code=400, detail="Setting already exists")
    return [{"status": "ok"}]


@app.get("/settings/{token}")
async def read_settings(token: str):
    if token != authorized["token"]:
        raise HTTPException(status_code=401, detail="Unauthorized")
    async with aiosqlite.connect(DATABASE_URL) as db:
        cursor = await db.execute('SELECT * FROM settings')
        settings = await cursor.fetchall()
        return [{"name": row[0], "value": row[1]} for row in settings]


@app.put("/settings/{name}")
async def update_setting(setting: Setting):
    async with aiosqlite.connect(DATABASE_URL) as db:
        cursor = await db.execute('UPDATE settings SET value = ? WHERE name = ?', (setting.value, setting.name))
        await db.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Setting not found")
    return [{"status": "ok"}]


@app.delete("/settings/{name}")
async def delete_setting(name: str):
    async with aiosqlite.connect(DATABASE_URL) as db:
        cursor = await db.execute('DELETE FROM settings WHERE name = ?', (name,))
        await db.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Setting not found")
    return [{"status": "ok"}]


@app.post("/users/")
async def create_post(user: User):
    async with aiosqlite.connect(DATABASE_URL) as db:
        try:
            await db.execute('INSERT INTO users (id, name) VALUES (?, ?)', (user.id, user.name))
            await db.commit()
        except aiosqlite.IntegrityError:
            raise HTTPException(status_code=400, detail="user already exists")
    return [{"status": "ok"}]


@app.get("/users/{token}")
async def read_posts(token: str):
    try:
        if token != authorized["token"]:
            raise HTTPException(status_code=401, detail="Unauthorized")
        async with aiosqlite.connect(DATABASE_URL) as db:
            cursor = await db.execute('SELECT * FROM users')
            posts = await cursor.fetchall()
            return [{"id": row[0], "name": row[1]} for row in posts]
    except aiosqlite.DatabaseError:
        raise HTTPException(status_code=400, detail="Error reading users from database")


@app.get("/users/json/{token}")
async def read_posts_json(token: str):
    if token != authorized["token"]:
        raise HTTPException(status_code=401, detail="Unauthorized")
    async with aiosqlite.connect(DATABASE_URL) as db:
        cursor = await db.execute('SELECT * FROM users')
        rows = await cursor.fetchall()
        column_names = [description[0] for description in cursor.description]
        posts = [dict(zip(column_names, row)) for row in rows]
        try:
            file_path = "clients.json"
            with open(file_path, "w") as file:
                json.dump(posts, file, indent=4)
            return FileResponse(file_path, media_type='application/json', filename=f"{file_path}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.get("/posts/json/{token}")
async def read_posts_json(token: str):
    if token != authorized["token"]:
        raise HTTPException(status_code=401, detail="Unauthorized")
    async with aiosqlite.connect(DATABASE_URL) as db:
        cursor = await db.execute('SELECT * FROM posts')
        rows = await cursor.fetchall()
        column_names = [description[0] for description in cursor.description]
        posts = [dict(zip(column_names, row)) for row in rows]
        try:
            file_path = "posts.json"
            with open(file_path, "w") as file:
                json.dump(posts, file, indent=4)
            return FileResponse(file_path, media_type='application/json', filename=f"{file_path}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.delete("/users/{ids}")
async def delete_post(ids: int):
    async with aiosqlite.connect(DATABASE_URL) as db:
        cursor = await db.execute('DELETE FROM users WHERE id = ?', (ids,))
        await db.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="user not found")
    return [{"status": "ok"}]


@app.post("/users/remove")
async def remove_posts(post: RemovedUser):
    async with aiosqlite.connect(DATABASE_URL) as db:
        try:
            if post.target == 'all':
                await db.execute('DELETE FROM users')
                await db.commit()
        except aiosqlite.IntegrityError:
            raise HTTPException(status_code=400, detail="user already exists")
    return [{"status": "ok"}]


@app.on_event("startup")
async def startup_event():
    await client.connect()
    await init_db()
    if not await client.is_user_authorized():
        raise HTTPException(status_code=403, detail="post not authorized")


@app.on_event("shutdown")
async def shutdown_event():
    await client.disconnect()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="192.168.50.70", port=8080)
