from uuid import UUID

from pydantic import BaseModel


class BasePackageRate(BaseModel):
    name: str
    base_rate: float
    base_weight: float
    oversize_rate: float
    overweight_rate_per_kg: float
    fragile_rate: float
    urgent_rate: float


class PackageRate(BasePackageRate):
    id: UUID


class PackageRateCreate(BasePackageRate):
    pass


class PackageRateUpdate(BasePackageRate):
    name: str | None = None
    base_rate: float | None = None
    base_weight: float | None = None
    oversize_rate: float | None = None
    overweight_rate_per_kg: float | None = None
    fragile_rate: float | None = None
    urgent_rate: float | None = None
