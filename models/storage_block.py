from pydantic import BaseModel, Field
from uuid import UUID


class BaseStorageBlock(BaseModel):
    name: str
    max_weight: float = Field(gt=0)
    max_size: float = Field(gt=0)
    max_package: int = Field(gt=0)


class StorageBlock(BaseStorageBlock):
    id: UUID


class StorageBlockCreate(BaseStorageBlock):
    pass


class StorageBlockUpdate(BaseModel):
    name: str | None = None
    max_weight: float | None = None
    max_size: float | None = None
    max_package: float | None = None
