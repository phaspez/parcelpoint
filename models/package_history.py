from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class BasePackageHistory(BaseModel):
    package_id: UUID
    staff: UUID
    action: str
    notes: str
    timestamp: datetime


class PackageHistory(BasePackageHistory):
    id: UUID


class PackageHistoryCreate(BasePackageHistory):
    pass


class PackageHistoryUpdate(BasePackageHistory):
    staff: UUID | None = None
    action: str | None = None
    notes: str | None = None
    timestamp: datetime | None = None
