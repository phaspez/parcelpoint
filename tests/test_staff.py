import datetime
import random
from uuid import uuid4

import pytest

from models.users.account import AccountCreate, AccountUpdate
from models.users.staff import StaffCreateNoID, StaffUpdate, StaffDetails
from conftest import client


@pytest.fixture
def random_address_id(client):
    response = client.get("/address")
    choice = random.choice(response.json())
    return choice["id"]


def test_get_invalid_format(client):
    response = client.get(f"/staff/{uuid4()}")
    print(response.json())
    assert response.status_code == 404
    assert response.json()["detail"]


def test_create_staff(client, random_address_id):
    account_create = AccountCreate(
        name="Test name 2",
        password="password",
        phone="0000000013",
        email="email2@gmail.com",
        address_id=random_address_id,
        street="Street Name",
    )

    staff_create = StaffCreateNoID(
        position="Position",
        department="Department",
        hire_date=datetime.date.today(),
        access_level=0,
    )

    jsoned = {
        "account_create": account_create.model_dump(),
        "staff_create": staff_create.model_dump(),
    }

    jsoned["staff_create"]["hire_date"] = str(datetime.date.today())
    jsoned["account_create"]["address_id"] = str(random_address_id)
    print(jsoned)
    response = client.post("/staff/register", json=jsoned)
    print(response.json())
    assert response.status_code == 200 or response.status_code == 201

    assert StaffDetails(**response.json())

    test_create_staff.created_data = response.json()


test_create_staff.created_data = None


@pytest.fixture
def created_staff():
    if not test_create_staff.created_data:
        raise ValueError("test_create_staff must be run before using this fixture")
    return (
        test_create_staff.created_data["account_id"],
        test_create_staff.created_data,
    )


def test_get_staff(client):
    response = client.get("/staff")
    assert response.status_code == 200

    test_get_staff.data = response.json()


test_get_staff.data = None


@pytest.fixture
def get_list_of_staffs():
    if not test_get_staff.data:
        raise ValueError("test_get_staff must be run before using this fixture")
    return test_get_staff.data


def test_get_staff_by_id(client, get_list_of_staffs):
    staffs = get_list_of_staffs
    choice = random.choice(staffs)
    existing_id = choice["account_id"]
    response = client.get(f"/staff/{existing_id}")
    print(response.json())
    assert response.status_code == 200
    assert response.json()["account_id"] == existing_id

    response_detailed = client.get(f"/staff/{existing_id}?is_detailed=true")
    print(response_detailed.json())
    assert response_detailed.status_code == 200
    assert (
        response_detailed.json()["account_id"]
        == response_detailed.json()["account"]["id"]
        == existing_id
    )


def test_update_staff(client, get_list_of_staffs):
    staffs = get_list_of_staffs
    choice = random.choice(staffs)
    existing_id = choice["account_id"]
    staff_updated = StaffUpdate(
        access_level=1,
        position="Position Updated",
    )
    account_updated = AccountUpdate(street="Updated street")
    jsoned = {
        "staff_updated": staff_updated.model_dump(),
        "account_updated": account_updated.model_dump(),
    }

    response = client.patch(f"/staff/{existing_id}", json=jsoned)
    assert response.status_code == 200
    assert StaffDetails(**response.json())


def test_delete_staff(client, created_staff):
    account_id, model = created_staff
    response = client.delete(f"/staff/{account_id}")
    assert response.status_code == 200
    assert StaffDetails(**response.json())


def test_delete_invalid(client):
    response = client.delete(f"/staff/{uuid4()}")
    print(response.json())
    assert response.status_code == 404
