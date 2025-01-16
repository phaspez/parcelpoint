from typing import List, Type
from uuid import uuid4, UUID

from sqlalchemy import and_, text, func
from sqlalchemy.orm import Session

from models.storage_block import StorageBlockCreate, StorageBlockUpdate
from repositories.base import BaseRepository
from schemas.package import PackageSchema
from schemas.storage_block import StorageBlockSchema
from scripts.block_constrain import block_constrain


class StorageBlockRepository(
    BaseRepository[StorageBlockSchema, StorageBlockCreate, StorageBlockUpdate]
):
    def __init__(self, db: Session):
        super().__init__(db, StorageBlockSchema)

    def get_sum_size(self, block_id: UUID | None) -> float:
        total_volume = (
            self.db.query(
                func.sum(
                    PackageSchema.width * PackageSchema.length * PackageSchema.height
                )
            )
            .filter(PackageSchema.block_id == block_id)
            .scalar()
        )
        return float(total_volume)

    def get_sum_count(self, block_id: UUID | None) -> int:
        total_count = (
            self.db.query(func.count(PackageSchema))
            .filter(PackageSchema.block_id == block_id)
            .scalar()
        )

        return int(total_count)

    def get_sum_weight(self, block_id: UUID | None) -> float:
        total_weight = (
            self.db.query(func.sum(PackageSchema.weight))
            .filter(PackageSchema.block_id == block_id)
            .scalar()
        )
        return float(total_weight)
