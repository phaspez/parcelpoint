from uuid import uuid4

import pytest

from conftest import client
from models.package_rate import PackageRateCreate


def test_get_package_rates(client):
    response = client.get("/api/v1/package_rate")
    assert response.status_code == 200


def test_create_package_rate(client):
    package_rate = PackageRateCreate(
        name="Test Package Rate",
        base_rate=21000,
        base_weight=2,
        oversize_rate=10000,
        overweight_rate_per_kg=5000,
        fragile_rate=15000,
        urgent_rate=20000,
    )

    response = client.post("/api/v1/package_rate", json=package_rate.model_dump())
    assert response.status_code == 200 or response.status_code == 201

    test_create_package_rate.created_data = response.json()


test_create_package_rate.created_data = None


@pytest.fixture
def created_package_rate():
    if not test_create_package_rate.created_data:
        raise ValueError(
            "test_create_package_rate must be run before using this fixture"
        )
    return (
        test_create_package_rate.created_data["id"],
        test_create_package_rate.created_data,
    )


def test_get_invalid_format(client):
    response = client.get(f"/api/v1/package_rate/{uuid4()}")
    assert response.status_code == 404
    assert response.json()["detail"]


def test_get_package_rate_by_id(client, created_package_rate):
    id, data = created_package_rate
    response = client.get(f"/api/v1/package_rate/{id}")
    assert response.status_code == 200
    assert data == response.json()


def test_patch_package_rate(client, created_package_rate):
    id, json = created_package_rate
    json["name"] = "Updated Package Rate"
    json["urgent_rate"] = 25000
    response = client.patch(f"/api/v1/package_rate/{id}", json=json)
    assert response.status_code == 200
    assert response.json()["id"] == id
    assert response.json() == json


def test_delete_address(client, created_package_rate):
    id, _ = created_package_rate
    response = client.delete(f"/api/v1/package_rate/{id}")
    assert response.status_code == 200

    get_response = client.get(f"/api/v1/package_rate/{id}")
    assert get_response.status_code == 404
