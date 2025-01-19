import pytest

from conftest import client
from models.address import AddressCreate


def test_get_address(client):
    response = client.get("/api/v1/address")
    assert response.status_code == 200


def test_search_address(client):
    response = client.get("/api/v1/address/search?q=ninh%20kiều%20cần%20thơ")
    print(response.json())
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_create_address(client):
    """Test creating an address and return the created data for other tests"""
    address = AddressCreate(
        province="Test Province", district="Test district", commune="Test commune"
    )
    response = client.post("/api/v1/address", json=address.model_dump())
    assert response.status_code == 200
    created_data = response.json()
    assert created_data["id"]
    assert created_data["province"] == "Test Province"
    assert created_data["district"] == "Test district"
    assert created_data["commune"] == "Test commune"

    # Store the created address data in a class variable for other tests to use
    test_create_address.created_data = created_data


# Initialize the class variable
test_create_address.created_data = None


@pytest.fixture
def created_address():
    """Fixture that returns the data from the create test"""
    if not test_create_address.created_data:
        raise ValueError("test_create_address must be run before using this fixture")
    return test_create_address.created_data["id"], test_create_address.created_data


def test_get_invalid_format(client):
    response = client.get("/api/v1/address/510c79af-deda-405c-b749-99f63c474207")
    assert response.status_code == 404
    assert response.json()["detail"]


def test_get_address_by_id(client, created_address):
    address_id, json = created_address
    response = client.get(f"/api/v1/address/{address_id}")
    assert response.status_code == 200
    assert json == response.json()


def test_patch_address(client, created_address):
    address_id, json = created_address
    json["province"] = "Updated Province"
    response = client.patch(f"/api/v1/address/{address_id}", json=json)
    assert response.status_code == 200
    assert response.json()["id"] == address_id
    assert response.json()["province"] == "Updated Province"


def test_delete_address(client, created_address):
    address_id, _ = created_address
    response = client.delete(f"/api/v1/address/{address_id}")
    assert response.status_code == 200

    # Verify the address is actually deleted
    get_response = client.get(f"/api/v1/address/{address_id}")
    assert get_response.status_code == 404
