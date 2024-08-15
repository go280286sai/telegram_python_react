import pytest
from dotenv import load_dotenv
import requests
import os

load_dotenv()
url = os.getenv('URL_PATH')

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
def test_get_users(test_register):
    response = requests.get(url + '/users/1')
    assert response.status_code == 401
    assert response.json() == {'detail': 'Unauthorized'}
    response = requests.get(url + f'/users/{test_register}')
    assert response.status_code == 200
    assert response.json() == []


def test_insert_users(test_register):
    data = {
        "name": "test",
        "id": 1
    }
    req = requests.post(url + "/users", json=data, headers={"Content-Type": "application/json"})
    assert req.status_code == 200
    res = req.json()
    assert res[0]['status'] == 'ok'
    post = requests.get(url + f'/users/{test_register}')
    assert post.status_code == 200
    res = post.json()
    assert res == [data]


def test_delete_users(test_register):
    req = requests.delete(url + "/users/1")
    assert req.status_code == 200
    res = req.json()
    assert res[0]['status'] == 'ok'
    response = requests.get(url + f'/users/{test_register}')
    assert response.status_code == 200
    assert response.json() == []


def test_delete_all(test_register):
    data = {
        "name": "test",
        "id": 1
    }
    req = requests.post(url + "/users", json=data, headers={"Content-Type": "application/json"})
    assert req.status_code == 200
    res = req.json()
    assert res[0]['status'] == 'ok'
    post = requests.get(url + f'/users/{test_register}')
    assert post.status_code == 200
    res = post.json()
    assert res == [data]
    data2 = {
        "target": "all"
    }
    requests.post(url + "/users/remove", json=data2, headers={"Content-Type": "application/json"})
    response = requests.get(url + f'/users/{test_register}')
    assert response.status_code == 200
    assert response.json() == []


