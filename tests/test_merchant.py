import datetime
import random
from uuid import uuid4

import pytest

from conftest import client
from models.users.account import AccountCreate, AccountUpdate
from models.users.merchant import (
    MerchantUpdate,
    MerchantDetails,
    MerchantCreateNoID,
)


@pytest.fixture
def random_address_id(client):
    response = client.get("/api/v1/address")
    choice = random.choice(response.json())
    return choice["id"]


def test_get_invalid_format(client):
    response = client.get(f"/api/v1/merchant/{uuid4()}")
    print(response.json())
    assert response.status_code == 404
    assert response.json()["detail"]


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
    response = client.post("/api/v1/merchant/register", json=jsoned)
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


def test_get_merchant(client):
    response = client.get("/api/v1/merchant")
    assert response.status_code == 200

    test_get_merchant.data = response.json()


test_get_merchant.data = None


@pytest.fixture
def get_list_of_merchants():
    if not test_get_merchant.data:
        raise ValueError("test_get_merchant must be run before using this fixture")
    return test_get_merchant.data


def test_get_merchant_by_id(client, get_list_of_merchants):
    merchants = get_list_of_merchants
    choice = random.choice(merchants)
    existing_id = choice["account_id"]
    response = client.get(f"/api/v1/merchant/{existing_id}")
    print(response.json())
    assert response.status_code == 200
    assert response.json()["account_id"] == existing_id

    response_detailed = client.get(f"/api/v1/merchant/{existing_id}?is_detailed=true")
    print(response_detailed.json())
    assert response_detailed.status_code == 200
    assert (
        response_detailed.json()["account_id"]
        == response_detailed.json()["account"]["id"]
        == existing_id
    )


def test_update_merchant(client, get_list_of_merchants):
    merchants = get_list_of_merchants
    choice = random.choice(merchants)
    existing_id = choice["account_id"]
    merchant_updated = MerchantUpdate(
        merchant_description=f"Desc Updated at {datetime.datetime.now()}",
        registration_date=datetime.date.today(),
    )
    account_updated = AccountUpdate(street="Updated street")
    jsoned = {
        "merchant_updated": merchant_updated.model_dump(),
        "account_updated": account_updated.model_dump(),
    }
    jsoned["merchant_updated"]["registration_date"] = str(datetime.date.today())

    print(jsoned)

    response = client.patch(f"/api/v1/merchant/{existing_id}", json=jsoned)
    print(response.json())
    assert response.status_code == 200
    assert MerchantDetails(**response.json())


def test_delete_merchant(client, created_merchant):
    account_id, model = created_merchant
    response = client.delete(f"/api/v1/merchant/{account_id}")
    assert response.status_code == 200
    assert MerchantDetails(**response.json())


def test_delete_invalid(client):
    response = client.delete(f"/api/v1/merchant/{uuid4()}")
    print(response.json())
    assert response.status_code == 404
