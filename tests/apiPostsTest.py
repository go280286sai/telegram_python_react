import pytest
from dotenv import load_dotenv
import requests
import os

load_dotenv()
url = os.getenv('URL_PATH')


@pytest.fixture
def data():
    data = {
        "description": "test",
        "id": 1
    }
    return data

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

def gets_data(data):
    req = requests.post(url + "/posts", json=data, headers={"Content-Type": "application/json"})
    assert req.status_code == 200
    res = req.json()
    assert res[0]['status'] == 'ok'


def test_get_posts(test_register):
    response = requests.get(url + '/posts/1')
    assert response.status_code == 401
    assert response.json() == {'detail': 'Unauthorized'}
    response = requests.get(url + f'/posts/{test_register}')
    assert response.status_code == 200
    assert response.json() == []


def test_insert_post(data, test_register):
    gets_data(data)
    post = requests.get(url + f'/posts/{test_register}')
    assert post.status_code == 200
    res = post.json()
    assert res == [data]


def test_delete_posts(test_register):
    req = requests.delete(url + "/posts/1")
    assert req.status_code == 200
    res = req.json()
    assert res[0]['status'] == 'ok'
    response = requests.get(url + f'/posts/{test_register}')
    assert response.status_code == 200
    assert response.json() == []


def test_delete_all(data, test_register):
    gets_data(data)
    post = requests.get(url + f'/posts/{test_register}')
    assert post.status_code == 200
    res = post.json()
    assert res == [data]
    data2 = {
        "target": "all"
    }
    requests.post(url + "/posts/remove", json=data2, headers={"Content-Type": "application/json"})
    response = requests.get(url + f'/posts/{test_register}')
    assert response.status_code == 200
    assert response.json() == []
