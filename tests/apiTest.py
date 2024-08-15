from dotenv import load_dotenv
import pytest
import requests
import os

load_dotenv()

url = os.getenv('URL_PATH')
user_id = os.getenv('USER_ID')

@pytest.fixture
def test_register():
    data = {
        "email": "admin@admin.ua",
        "password": "password"
    }
    req = requests.post(url + "/register", json=data, headers={"Content-Type": "application/json"})
    assert req.status_code == 200
    res = req.json()
    assert res[0]['status'] == True
    return res[0]['token']

@pytest.fixture
def test_get_groups(test_register):
    req = requests.get(url + f"/get_groups/{test_register}")
    assert req.status_code == 200
    res = req.json()
    assert len(res) > 0
    return res


def test_get_messages(test_get_groups, test_register):
    body = test_get_groups
    ids = body[0]["id"]
    req = requests.get(url + f"/get_messages/{ids}/{test_register}")
    assert req.status_code == 200
    res = req.json()
    assert len(res) > 0


def test_send_message():
    data = {
        "group_id": f"{user_id}",
        "message": "Hello, World!"
    }
    req = requests.post(url + "/send_message", json=data, headers={"Content-Type": "application/json"})
    assert req.status_code == 200
    res = req.json()
    assert res[0]['status'] == 'ok'


def test_get_post(test_register):
    req = requests.get(url + f"/get_post/{user_id}/{test_register}")
    assert req.status_code == 200
    res = req.json()
    assert res['name']


def test_get_search_messages(test_register):
    txt = "Hello"
    req = requests.get(url + f"/get_search/{txt}/{test_register}")
    assert req.status_code == 200
    res = req.json()
    assert len(res) > 0
