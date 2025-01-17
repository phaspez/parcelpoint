from pydantic import BaseModel
from uuid import UUID


class BaseStorageBlock(BaseModel):
    name: str
    max_weight: float
    max_size: float
    max_package: int


class StorageBlock(BaseStorageBlock):
    id: UUID


class StorageBlockCreate(BaseStorageBlock):
    pass


class StorageBlockUpdate(BaseModel):
    name: str | None = None
    max_weight: float | None = None
    max_size: float | None = None
    max_package: float | None = None
