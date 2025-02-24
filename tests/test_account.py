import random

import pytest

from conftest import client
from models.users.account import (
    AccountCreate,
    Account,
    AccountUpdate,
    AccountLogin,
    Token,
)


@pytest.fixture
def random_address_id(client):
    response = client.get("/api/v1/address")
    choice = random.choice(response.json())
    return choice["id"]


# def test_get_accounts_not_logged_in(client):
#     response = client.get("/api/v1/account")
#     assert response.status_code == 401


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
    response = client.post("/api/v1/account", json=account_modified)
    assert response.status_code == 200
    print(response.json())
    assert Account(**response.json())

    test_create_account.created_data = response.json()


test_create_account.created_data = None


@pytest.fixture
def created_account():
    if not test_create_account.created_data:
        raise ValueError("test_create_account must be run before using this fixture")
    return test_create_account.created_data["id"], test_create_account.created_data


def test_login_email(client, created_account):
    id, data = created_account
    login = AccountLogin(email=data["email"], password="password")
    response = client.post(
        "/api/v1/account/login",
        data={"username": login.email, "password": login.password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 200
    assert response.json()

    print(response.json())
    test_login_email.created_data = response.json()


test_login_email.created_data = None


@pytest.fixture
def created_token():
    if not test_login_email.created_data:
        raise ValueError("test_login must be run before using this fixture")
    return test_login_email.created_data["access_token"]


# def test_get_accounts_logged_in(client, created_token):
#     client.cookies = {"token": created_token}
#     response = client.get("/api/v1/account")
#     assert response.status_code == 200
#     assert response.json()


def test_login_empty(client):
    response = client.post(
        "/api/v1/account/login",
        data={"username": "", "password": ""},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 400

    print(response.json())


def test_patch_account(client, created_account, created_token):
    account_id, data = created_account
    updated = AccountUpdate(gmail="changed@gmail.com", name="changed name")
    response = client.patch(
        f"/api/v1/account/{account_id}",
        json=updated.model_dump(),
        headers={
            "Authorization": f"Bearer {created_token}",
        },
    )
    assert response.status_code == 200
    assert Account(**response.json())

    print(response.json())


def test_patch_account_nothing_changed(client, created_account, created_token):
    account_id, data = created_account
    updated = AccountUpdate()
    response = client.patch(
        f"/api/v1/account/{account_id}",
        json=updated.model_dump(),
        headers={
            "Authorization": f"Bearer {created_token}",
        },
    )
    assert response.status_code == 200
    assert Account(**response.json())

    print(response.json())


def test_patch_account_existing_unique(client, created_account, created_token):
    account_id, data = created_account
    updated = AccountUpdate(phone="0000000002")
    response = client.patch(
        f"/api/v1/account/{account_id}",
        json=updated.model_dump(),
        headers={
            "Authorization": f"Bearer {created_token}",
        },
    )
    assert response.status_code == 400

    print(response.json())


def test_delete_account(client, created_account, created_token):
    account_id, data = created_account
    response = client.delete(
        f"/api/v1/account/{account_id}",
        headers={
            "Authorization": f"Bearer {created_token}",
        },
    )
    assert response.status_code == 200

    print(response.json())
