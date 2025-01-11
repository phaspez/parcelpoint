import datetime
import random
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from main import app
from models.account import AccountCreate, AccountUpdate
from models.merchant import (
    MerchantUpdate,
    MerchantDetails,
    MerchantCreateNoID,
)

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


def test_get_merchant(client):
    response = client.get("/merchant")
    assert response.status_code == 200

    print(response.json())


def test_get_invalid_format(client):
    response = client.get(f"/merchant/{uuid4()}")
    print(response.json())
    assert response.status_code == 404
    assert response.json()["detail"]


def test_get_merchant_by_id(client):
    existing_id = "8cb8c4a5-c5b3-44fa-9079-c99f9d6e2916"
    response = client.get(f"/merchant/{existing_id}")
    print(response.json())
    assert response.status_code == 200
    assert response.json()["account_id"] == existing_id

    response_detailed = client.get(f"/merchant/{existing_id}?is_detailed=true")
    print(response_detailed.json())
    assert response_detailed.status_code == 200
    assert (
        response_detailed.json()["account_id"]
        == response_detailed.json()["account"]["id"]
        == existing_id
    )


def test_update_merchant(client):
    existing_id = "8cb8c4a5-c5b3-44fa-9079-c99f9d6e2916"
    merchant_updated = MerchantUpdate(
        company_name="test_username_2_company updated",
        registration_date=datetime.date.today(),
    )
    account_updated = AccountUpdate(street="Updated street")
    jsoned = {
        "merchant_updated": merchant_updated.model_dump(),
        "account_updated": account_updated.model_dump(),
    }
    jsoned["merchant_updated"]["registration_date"] = str(datetime.date.today())

    print(jsoned)

    response = client.patch(f"/merchant/{existing_id}", json=jsoned)
    print(response.json())
    assert response.status_code == 200
    assert MerchantDetails(**response.json())


def test_create_merchant(client, random_address_id):
    account_create = AccountCreate(
        name="Test name",
        password="password",
        phone="0000000012",
        email="email@gmail.com",
        address_id=random_address_id,
        street="Street Name",
    )

    merchant_create = MerchantCreateNoID(
        company_name="Corporation",
        merchant_description="desc",
        registration_date=datetime.date.today(),
    )

    jsoned = {
        "account_create": account_create.model_dump(),
        "merchant_create": merchant_create.model_dump(),
    }
    print(random_address_id)
    jsoned["merchant_create"]["registration_date"] = str(datetime.date.today())
    jsoned["account_create"]["address_id"] = str(random_address_id)
    print(jsoned)
    response = client.post("/merchant/register", json=jsoned)
    print(response.json())
    assert response.status_code == 200 or response.status_code == 201

    assert MerchantDetails(**response.json())

    test_create_merchant.created_data = response.json()


test_create_merchant.created_data = None


@pytest.fixture
def created_merchant():
    if not test_create_merchant.created_data:
        raise ValueError("test_create_merchant must be run before using this fixture")
    return (
        test_create_merchant.created_data["account_id"],
        test_create_merchant.created_data,
    )


def test_delete_merchant(client, created_merchant):
    account_id, model = created_merchant
    response = client.delete(f"/merchant/{account_id}")
    assert response.status_code == 200
    assert MerchantDetails(**response.json())


def test_delete_invalid(client):
    response = client.delete(f"/merchant/{uuid4()}")
    print(response.json())
    assert response.status_code == 404
