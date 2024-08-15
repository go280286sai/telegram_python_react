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

def test_get_settings(test_register):
    response = requests.get(url + f'/settings/{test_register}')
    assert response.status_code == 200
    assert response.json() == []


def test_insert_settings():
    data = {
        "name": "test",
        "value": "my value"
    }
    req = requests.post(url + "/settings", json=data, headers={"Content-Type": "application/json"})
    assert req.status_code == 200
    res = req.json()
    assert res[0]['status'] == 'ok'


def test_update_settings(test_register):
    data = {
        "name": "test",
        "value": "my new value"
    }
    req = requests.put(url + "/settings/test", json=data, headers={"Content-Type": "application/json"})
    assert req.status_code == 200
    res = req.json()
    assert res[0]['status'] == 'ok'
    response = requests.get(url + f'/settings/{test_register}')
    assert response.status_code == 200
    res = response.json()
    assert res[0]['value'] == 'my new value'


def test_delete_settings(test_register):
    req = requests.delete(url + "/settings/test")
    assert req.status_code == 200
    res = req.json()
    assert res[0]['status'] == 'ok'
    response = requests.get(url + f'/settings/{test_register}')
    assert response.status_code == 200
    res = response.json()
    assert res == []
