from main import app
from fastapi.testclient import TestClient
import pytest
from conftest import client


def test_get_storage_block(client):
    response = client.get("/storage_block")
    assert response.status_code == 200
