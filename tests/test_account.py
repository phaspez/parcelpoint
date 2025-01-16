from main import app
from fastapi.testclient import TestClient
import pytest
import random
from models.account import AccountCreate, Account, AccountUpdate, AccountLogin, Token
from seedings.account import email

# cookie cred for phone 0000000002 password "password"
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhjYjhjNGE1LWM1YjMtNDRmYS05MDc5LWM5OWY5ZDZlMjkxNiIsIm5hbWUiOiJ0ZXN0X3VzZXJuYW1lXzIiLCJoYXNoZWRfcGFzc3dvcmQiOiIkMmIkMTIkZlFQanQ4UlZhQjA1dDA3Z2UwZkRIT1BxTFBUMTk4LndyWGR4VXFqeFVGeThaQ3l5RVk5Yi4iLCJwaG9uZSI6IjAwMDAwMDAwMDIiLCJlbWFpbCI6InRlc3RfdXNlcm5hbWVfMkBleGFtcGxlLmNvbSIsImFkZHJlc3NfaWQiOiI2YTdlZTQzYy1iY2M0LTQ2YzItYjQ4Ny1lYjNmYjMzODI5OWYiLCJzdHJlZXQiOiJzdHJlZXQgbmFtZSAyIiwiZXhwIjoxNzM2ODg3MDc4fQ.ne-D7_QW3t-bCL0UHiNDXfbn7KDwF48PkOdC7VqO8Vk"


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def random_address_id(client):
    response = client.get("/address")
    choice = random.choice(response.json())
    return choice["id"]


def test_get_accounts_not_logged_in(client):
    response = client.get("/account")
    assert response.status_code == 401


def test_create_account(client, random_address_id):
    account = AccountCreate(
        address_id=random_address_id,
        password="password",
        email="em@gmail.com",
        phone="9999999999",
        name="Test name",
        street="This street",
    )
    account_modified = account.model_dump()
    account_modified["address_id"] = str(random_address_id)
    response = client.post("/account", json=account_modified)
    assert response.status_code == 200
    assert Account(**response.json())

    test_create_account.created_data = response.json()


# Initialize the class variable
test_create_account.created_data = None


@pytest.fixture
def created_account():
    """Fixture that returns the data from the create test"""
    if not test_create_account.created_data:
        raise ValueError("test_create_account must be run before using this fixture")
    return test_create_account.created_data["id"], test_create_account.created_data


def test_login_email(client, created_account):
    account_id, data = created_account
    login = AccountLogin(email="em@gmail.com", password="password")
    response = client.post("/account/login", json=login.model_dump())
    assert response.status_code == 200
    assert response.json()

    token = Token(**response.json())
    test_login_email.created_data = token.model_dump()


test_login_email.created_data = None


@pytest.fixture
def created_token():
    if not test_login_email.created_data:
        raise ValueError("test_login must be run before using this fixture")
    return test_login_email.created_data["token"]


def test_get_accounts_logged_in(client, created_token):
    client.cookies = {"token": created_token}
    response = client.get("/account")
    assert response.status_code == 200
    assert response.json()


def test_login_empty(client, created_account):
    login = AccountLogin(password="password")
    response = client.post("/account/login", json=login.model_dump())
    assert response.status_code == 400

    print(response.json())


def test_patch_account(client, created_account):
    account_id, data = created_account
    updated = AccountUpdate(gmail="changed@gmail.com", name="changed name")
    response = client.patch(f"/account/{account_id}", json=updated.model_dump())
    assert response.status_code == 200
    assert Account(**response.json())

    print(response.json())


def test_patch_account_nothing_changed(client, created_account):
    account_id, data = created_account
    updated = AccountUpdate()
    response = client.patch(f"/account/{account_id}", json=updated.model_dump())
    assert response.status_code == 200
    assert Account(**response.json())

    print(response.json())


def test_patch_account_existing_unique(client, created_account):
    account_id, data = created_account
    updated = AccountUpdate(phone="0000000002")
    response = client.patch(f"/account/{account_id}", json=updated.model_dump())
    assert response.status_code == 500

    print(response.json())


def test_delete_account(client, created_account):
    account_id, data = created_account
    response = client.delete(f"/account/{account_id}")
    assert response.status_code == 200

    print(response.json())
