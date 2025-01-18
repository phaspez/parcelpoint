import random
from http.client import responses
from uuid import uuid4

import pytest
from pydantic import UUID1

from conftest import client
from models.package import PackageCreate, Package


@pytest.fixture
def get_merchants(client):
    merchants = client.get("/merchant")
    return merchants.json()


@pytest.fixture
def random_order_id(client):
    response = client.get("/order")
    choice = random.choice(response.json())
    return choice["id"]


@pytest.fixture
def random_staff_id(client):
    response = client.get("/staff")
    choice = random.choice(response.json())
    return choice["account_id"]


@pytest.fixture
def random_merchant_id(client):
    response = client.get("/merchant")
    choice = random.choice(response.json())
    return choice["account_id"]


@pytest.fixture
def random_address_id(client):
    response = client.get("/address")
    choice = random.choice(response.json())
    return choice["id"]


@pytest.fixture
def random_package_rate_id(client):
    response = client.get("/package_rate")
    choice = random.choice(response.json())
    return choice["id"]


def test_get_packages(client):
    response = client.get("/package")
    assert response.status_code == 200


def test_create_package(
    client,
    random_merchant_id,
    random_order_id,
    random_address_id,
    random_package_rate_id,
):
    package = PackageCreate(
        merchant_id=random_merchant_id,
        order_id=random_order_id,
        description="Package description test",
        package_rate_id=random_package_rate_id,
        address_id=random_address_id,
        street="This street",
        name="Test receiver name",
        phone="0123456789",
        cod_cost=75000,
        width=10,
        length=10,
        height=5,
        weight=1,
    )

    jsoned = package.model_dump()
    jsoned["merchant_id"] = str(package.merchant_id)
    jsoned["order_id"] = str(package.order_id)
    jsoned["address_id"] = str(package.address_id)
    jsoned["package_rate_id"] = str(package.package_rate_id)

    response = client.post("/package", json=jsoned)
    assert response.status_code == 201 or response.status_code == 200
    assert Package(**response.json())
    print(Package(**response.json()))
    test_create_package.created_data = response.json()


test_create_package.created_data = None


@pytest.fixture
def created_packages(client):
    if not test_create_package.created_data:
        raise ValueError("test_create_package.created_data is required and success")
    return test_create_package.created_data["id"], test_create_package.created_data


def test_get_invalid_format(client):
    response = client.get(f"/package/{uuid4()}")
    assert response.status_code == 404
    assert response.json()["detail"]


def test_get_address_by_id(client, created_packages):
    id, json = created_packages
    response = client.get(f"/package/{id}")
    assert response.status_code == 200
    assert json == response.json()


def test_delete_package(client, created_packages):
    id, data = created_packages
    response = client.delete(f"/package/{id}")
    assert response.status_code == 200


# def test_patch_address(client, created_address):
#     address_id, json = created_address
#     json["province"] = "Updated Province"
#     response = client.patch(f"/address/{address_id}", json=json)
#     assert response.status_code == 200
#     assert response.json()["id"] == address_id
#     assert response.json()["province"] == "Updated Province"
#
#
# def test_delete_address(client, created_address):
#     address_id, _ = created_address
#     response = client.delete(f"/address/{address_id}")
#     assert response.status_code == 200
#
#     # Verify the address is actually deleted
#     get_response = client.get(f"/address/{address_id}")
#     assert get_response.status_code == 404
