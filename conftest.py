import pytest
from seedings import global_setup, global_teardown
from fastapi.testclient import TestClient
from main import app


@pytest.fixture(scope="session", autouse=True)
def global_setup_teardown():
    global_setup()
    print("\n[Setup] Global setup")

    yield

    global_teardown()
    print("\n[Teardown] Global teardown")


@pytest.fixture
def client():
    return TestClient(app)
