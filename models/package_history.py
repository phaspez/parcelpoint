from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class BasePackageHistory(BaseModel):
    package_id: UUID
    staff_id: UUID
    action: str
    notes: str
    timestamp: datetime = Field(default_factory=datetime.now)


class PackageHistory(BasePackageHistory):
    id: UUID


class PackageHistoryCreate(BasePackageHistory):
    pass


class PackageHistoryUpdate(BasePackageHistory):
    staff_id: UUID | None = None
    action: str | None = None
    notes: str | None = None
    timestamp: datetime | None = None
