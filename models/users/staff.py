from datetime import datetime
from models.users.account import Account
from pydantic import BaseModel
from uuid import UUID


class Staff(BaseModel):
    account_id: UUID
    position: str
    department: str
    hire_date: datetime
    access_level: int = 0


class StaffDetails(Staff):
    account: Account


class StaffCreate(Staff):
    pass


class StaffCreateNoID(BaseModel):
    position: str
    department: str
    hire_date: datetime
    access_level: int


class StaffUpdate(BaseModel):
    position: str | None = None
    department: str | None = None
    hire_date: datetime | None = None
    access_level: int | None = None
