import pytest
from conftest import client


@pytest.fixture
def get_merchants(client):
    merchants = client.get("/merchant")
    return merchants.json()


def test_get_packages(client):
    response = client.get("/package")
    assert response.status_code == 200


# def test_create_package(client):
#     package = PackageCreate()
#
#     # Store the created address data in a class variable for other tests to use
#     test_create_address.created_data = created_data
#
#
# # Initialize the class variable
# test_create_address.created_data = None
#
#
# @pytest.fixture
# def created_address():
#     """Fixture that returns the data from the create test"""
#     if not test_create_address.created_data:
#         raise ValueError("test_create_address must be run before using this fixture")
#     return test_create_address.created_data["id"], test_create_address.created_data
#
#
# def test_get_invalid_format(client):
#     response = client.get("/address/510c79af-deda-405c-b749-99f63c474207")
#     assert response.status_code == 404
#     assert response.json()["detail"]
#
#
# def test_get_address_by_id(client, created_address):
#     address_id, json = created_address
#     response = client.get(f"/address/{address_id}")
#     assert response.status_code == 200
#     assert json == response.json()
#
#
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
