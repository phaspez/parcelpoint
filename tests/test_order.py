import datetime
import random
from uuid import uuid4

import pytest

from conftest import client
from models.order import OrderCreate, Order, OrderUpdate


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


def test_get_invalid_format(client):
    response = client.get(f"/api/v1/order/{uuid4()}")
    print(response.json())
    assert response.status_code == 404
    assert response.json()["detail"]


def test_create_order(client, random_merchant_id, random_staff_id):
    order_create = OrderCreate(
        merchant_id=random_merchant_id,
        staff_id=random_staff_id,
        date=datetime.datetime.now(),
        details="Order Details",
    )

    jsoned = order_create.model_dump()
    jsoned["merchant_id"] = str(jsoned["merchant_id"])
    jsoned["staff_id"] = str(jsoned["staff_id"])
    jsoned["date"] = str(jsoned["date"])

    response = client.post("/api/v1/order", json=jsoned)
    print(response.json())
    assert response.status_code == 200 or response.status_code == 201

    assert Order(**response.json())

    test_create_order.created_data = response.json()


test_create_order.created_data = None


@pytest.fixture
def created_order():
    if not test_create_order.created_data:
        raise ValueError("test_create_order must be run before using this fixture")
    return (
        test_create_order.created_data["id"],
        test_create_order.created_data,
    )


def test_get_order(client):
    response = client.get("/api/v1/order")
    assert response.status_code == 200


def test_get_order_by_id(client, random_order_id):
    id = random_order_id
    response = client.get(f"/api/v1/order/{id}")
    print(response.json())
    assert response.status_code == 200
    assert response.json()["id"] == id


def test_update_order(client, random_order_id, random_staff_id, random_merchant_id):
    order_updated = OrderUpdate(
        merchant_id=random_merchant_id,
        staff_id=random_staff_id,
        date=datetime.datetime.now(),
        details="Order Details Updated",
    )
    jsoned = order_updated.model_dump()
    jsoned["merchant_id"] = str(jsoned["merchant_id"])
    jsoned["staff_id"] = str(jsoned["staff_id"])
    jsoned["date"] = str(jsoned["date"])

    response = client.patch(f"/api/v1/order/{random_order_id}", json=jsoned)
    print(response.json())
    assert response.status_code == 200
    assert Order(**response.json())


def test_delete_order(client, created_order):
    id, model = created_order
    response = client.delete(f"/api/v1/order/{id}")
    assert response.status_code == 200
    assert Order(**response.json())


def test_delete_invalid(client):
    response = client.delete(f"/api/v1/order/{uuid4()}")
    print(response.json())
    assert response.status_code == 404
