from datetime import datetime
from typing import Literal

from models.account import Account
from pydantic import BaseModel
from uuid import UUID


class BasePackage(BaseModel):
    block_id: UUID | None = None
    merchant_id: UUID
    description: str

    address_id: UUID
    street: str
    name: str
    phone: str

    width: float
    height: float
    length: float
    weight: float

    is_fragile: bool
    status: Literal["ORDERED", "DELIVERING", "DELIVERED", "CANCELLED", "MISSING"] = (
        "ORDERED"
    )

    shipping_cost: float = 0.0
    cod_cost: float = 0.0


class Package(BasePackage):
    id: UUID


class PackageCreate(BasePackage):
    pass


class PackageUpdate:
    block_id: UUID | None = None
    merchant_id: UUID | None = None
    description: str | None = None

    address_id: UUID | None = None
    street: str | None = None
    name: str | None = None
    phone: str | None = None

    width: float | None = None
    height: float | None = None
    length: float | None = None
    weight: float | None = None

    is_fragile: bool | None = None
    status: (
        Literal["ORDERED", "DELIVERING", "DELIVERED", "CANCELLED", "MISSING"] | None
    ) = None
    shipping_cost: float | None = None
    cod_cost: float | None = None
