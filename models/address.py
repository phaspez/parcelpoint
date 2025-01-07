from pydantic import BaseModel
from uuid import UUID


class Address(BaseModel):
    id: UUID
    province: str
    district: str
    commune: str


class AddressCreate(BaseModel):
    province: str
    district: str
    commune: str


class AddressUpdate(BaseModel):
    province: str | None = None
    district: str | None = None
    commune: str | None = None
