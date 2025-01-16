from main import app
from fastapi.testclient import TestClient
import pytest


@pytest.fixture
def client():
    return TestClient(app)


def test_get_storage_block(client):
    response = client.get("/storage_block")
    assert response.status_code == 200
