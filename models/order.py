from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class BaseOrder(BaseModel):
    merchant_id: str
    staff_id: str
    date: datetime
    details: str


class Order(BaseOrder):
    id: UUID


class OrderCreate(BaseOrder):
    pass


class OrderUpdate(BaseOrder):
    merchant_id: str | None = None
    staff_id: str | None = None
    date: datetime | None = None
    details: str | None = None
