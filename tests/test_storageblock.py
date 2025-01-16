from uuid import uuid4

from main import app
from fastapi.testclient import TestClient
import pytest
from conftest import client
from models.storage_block import StorageBlockCreate, StorageBlock, StorageBlockUpdate


def test_get_storage_block(client):
    response = client.get("/storage_block")
    assert response.status_code == 200


def test_get_invalid_block(client):
    response = client.get(f"/storage_block/{uuid4()}")
    assert response.status_code == 404


def test_create_block(client):
    block_create = StorageBlockCreate(
        name="Block", max_weight=100, max_size=100, max_package=5
    )
    response = client.post("/storage_block", json=block_create.model_dump())
    assert response.status_code == 200 or response.status_code == 201
    block = StorageBlock(**response.json())
    assert block.id
    test_create_block.created_data = block.model_dump()


test_create_block.created_data = None


@pytest.fixture
def get_block_data():
    if test_create_block.created_data is None:
        raise ValueError("test_create_block.created_data is None, it must be ran first")
    return test_create_block.created_data["id"], test_create_block.created_data


def test_update_block(client, get_block_data):
    id, data = get_block_data
    block_updated = StorageBlockUpdate(max_package=1)
    response = client.patch(f"/storage_block/{id}", json=block_updated.model_dump())
    assert response.status_code == 200


def test_delete_block(client, get_block_data):
    id, data = get_block_data
    response = client.delete(f"/storage_block/{id}")
    assert response.status_code == 200
