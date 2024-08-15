import pytest
from dotenv import load_dotenv
import requests
import os

load_dotenv()
url = os.getenv('URL_PATH')


def test_auth():
    data = {
        "email": "test",
        "password": "test"
    }
    req = requests.post(url + "/register", json=data, headers={"Content-Type": "application/json"})
    assert req.status_code == 200
    res = req.json()
    assert res[0]['status'] == False


def test_auth_err():
    data = {
        "login": 3,
        "password": "test"
    }
    req = requests.post(url + "/register", json=data, headers={"Content-Type": "application/json"})
    assert req.status_code == 422


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


def is_auth(test_register):
    token = test_register
    req = requests.get(url + f"/is_authorized/{token}", headers={"Content-Type": "application/json"})
    assert req.status_code == 200
    res = req.json()
    assert res[0]['status'] == True


def test_logout(test_register):
    token = test_register
    req = requests.get(url + "/logout/1", headers={"Content-Type": "application/json"})
    assert req.status_code == 500
    res = req.json()
    assert res['detail'] == "401: Unauthorized"
    req = requests.get(url + f"/logout/{token}", headers={"Content-Type": "application/json"})
    assert req.status_code == 200
    res = req.json()
    assert res[0]['status'] == True
