import random
from uuid import uuid4

import pytest

from conftest import client
from models.package import PackageCreate, Package
from seedings import get_storage_block_within_limits
from seedings.utils import get_storage_block_under_capacity, get_random_package_rate_id


@pytest.fixture
def get_merchants(client):
    merchants = client.get("/api/v1/merchant")
    return merchants.json()


@pytest.fixture
def random_order_id(client):
    response = client.get("/api/v1/order")
    choice = random.choice(response.json())
    return choice["id"]


@pytest.fixture
def random_staff_id(client):
    response = client.get("/api/v1/staff")
    choice = random.choice(response.json())
    return choice["account_id"]


@pytest.fixture
def random_merchant_id(client):
    response = client.get("/api/v1/merchant")
    choice = random.choice(response.json())
    return choice["account_id"]


@pytest.fixture
def random_address_id(client):
    response = client.get("/api/v1/address")
    choice = random.choice(response.json())
    return choice["id"]


@pytest.fixture
def random_package_rate_id(client):
    response = client.get("/api/v1/package_rate")
    choice = random.choice(response.json())
    return choice["id"]


def test_get_packages(client):
    response = client.get("/api/v1/package")
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

    response = client.post("/api/v1/package", json=jsoned)
    assert response.status_code == 201 or response.status_code == 200
    assert Package(**response.json())
    print(Package(**response.json()))
    test_create_package.created_data = response.json()


test_create_package.created_data = None


@pytest.fixture
def created_package(client):
    if not test_create_package.created_data:
        raise ValueError("test_create_package.created_data is required and success")
    return test_create_package.created_data["id"], test_create_package.created_data


def test_get_invalid_format(client):
    response = client.get(f"/api/v1/package/{uuid4()}")
    assert response.status_code == 404
    assert response.json()["detail"]


def test_get_package_by_id(client, created_package):
    id, json = created_package
    response = client.get(f"/api/v1/package/{id}")
    assert response.status_code == 200
    assert json == response.json()


def test_edit_package(client, created_package):
    id, json = created_package
    json["description"] = "Changed description"
    volume = json["width"] * json["height"] * json["length"]
    print(volume)
    blocks = get_storage_block_within_limits(volume, json["weight"])
    print(blocks)
    print(blocks[0][0])

    json["block_id"] = str(blocks[0][0])
    response = client.patch(f"/api/v1/package/{id}", json=json)
    assert response.status_code == 200
    assert response.json() == json


def test_edit_to_overflow_block(client, created_package):
    id, json = created_package
    orig_weight = json["weight"]
    orig_block = json["block_id"]
    orig_width, orig_length, orig_height = json["width"], json["length"], json["height"]

    blocks = get_storage_block_under_capacity(99999, 100, 10)
    print(blocks)
    json["block_id"] = str(blocks[0][0])
    if len(blocks) == 0:
        print("cant test because there is no blocks")

    print("TEST WITH WEIGHT")
    json["weight"] = 9999999
    response = client.patch(f"/api/v1/package/{id}", json=json)
    assert response.status_code == 400
    print("TEST WITH VOLUME")
    json["weight"] = 1
    json["width"], json["length"], json["height"] = 99999, 99999, 99999
    response = client.patch(f"/api/v1/package/{id}", json=json)
    assert response.status_code == 400

    json["weight"] = orig_weight
    json["width"], json["length"], json["height"] = orig_width, orig_length, orig_height
    json["block_id"] = orig_block


def test_price_change_on_package(client, created_package):
    id, json = created_package
    cod_cost = json["cod_cost"]
    package_rate_id = json["package_rate_id"]
    new_package_rate_id = package_rate_id
    while package_rate_id == new_package_rate_id:
        new_package_rate_id = str(get_random_package_rate_id())
    json["package_rate_id"] = new_package_rate_id
    print(f"OLD: {package_rate_id}, NEW: {new_package_rate_id}")
    print(json["block_id"])
    response = client.patch(f"/api/v1/package/{id}", json=json)
    assert response.status_code == 200
    assert response.json()["cod_cost"] != cod_cost
    print(f"Old cost: {cod_cost}, new cost: {response.json()['cod_cost']}")


def test_package_status_invalid(client, created_package):
    id, json = created_package
    json["status"] = "ABCDEF"
    response = client.patch(f"/api/v1/package/{id}", json=json)
    assert response.status_code == 422
    assert response.json()["detail"]
    json["status"] = "ORDERED"


def test_delete_package(client, created_package):
    id, data = created_package
    response = client.delete(f"/api/v1/package/{id}")
    assert response.status_code == 200
