from uuid import UUID

from sqlalchemy import and_, text, func, select
from sqlalchemy.orm import Session

from models.storage_block import StorageBlockCreate, StorageBlockUpdate, StorageBlock
from repositories.base import BaseRepository
from schemas.package import PackageSchema
from schemas.storage_block import StorageBlockSchema


class StorageBlockRepository(
    BaseRepository[StorageBlockSchema, StorageBlockCreate, StorageBlockUpdate]
):
    def __init__(self, db: Session):
        super().__init__(db, StorageBlockSchema)

    def update(self, id: UUID, schema: StorageBlockUpdate) -> StorageBlockSchema | None:
        print("checking valid storage block")
        try:
            curr_size = self.get_sum_size(id)
            if schema.max_size and curr_size > schema.max_size:
                raise ValueError(
                    "You can't adjust size that would overload existing packages"
                )
            curr_weight = self.get_sum_weight(id)
            if schema.max_weight and curr_weight > schema.max_weight:
                raise ValueError(
                    "You can't adjust weight that would overload existing packages"
                )
            curr_count = self.get_sum_count(id)
            if schema.max_package and curr_count > schema.max_package:
                raise ValueError(
                    "You can't adjust count that would overload existing packages"
                )
            print("now actually updating storage block")
            return super().update(id, schema)
        except Exception as e:
            print(e)

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
        return 0.0 if total_volume is None else float(total_volume)

    def get_sum_count(self, block_id: UUID | None) -> int:
        total_count = (
            self.db.query(func.count(PackageSchema.id))
            .filter(PackageSchema.block_id == block_id)
            .scalar()
        )

        return 0 if total_count is None else int(total_count)

    def get_sum_weight(self, block_id: UUID | None) -> float:
        total_weight = (
            self.db.query(func.sum(PackageSchema.weight))
            .filter(PackageSchema.block_id == block_id)
            .scalar()
        )
        return 0.0 if total_weight is None else float(total_weight)

    def check_if_exceed_limit(self, volume, weight, block_id: UUID | None) -> bool:
        result = self.db.execute(
            select(
                StorageBlock.max_weight, StorageBlock.max_size, StorageBlock.max_package
            ).where(and_(StorageBlock.id == block_id))
        ).fetchone()
        max_weight, max_size, max_package = result
        if self.get_sum_weight(block_id) + weight > max_weight:
            return True
        if self.get_sum_size(block_id) + volume > max_size:
            return True
        return self.get_sum_count(block_id) + 1 <= max_package

    def get_storage_block_within_limits(
        self, vol: float, weight: float, num_package: int = 1
    ):
        sql = text(
            """
            SELECT sb.*
            FROM parcelpoint.public.storageblock sb
            LEFT JOIN parcelpoint.public.package p ON sb.id = p.block_id
            GROUP BY sb.id, sb.max_package, sb.max_weight, sb.max_size
            HAVING 
                (sb.max_package >= (COUNT(p.id) + :num_package))
                AND (sb.max_weight >= (COALESCE(SUM(p.weight), 0) + :weight))
                AND (sb.max_size >= (COALESCE(SUM(p.width * p.length * p.height), 0) + :vol))
            ORDER BY 
                (sb.max_weight - COALESCE(SUM(p.weight), 0)) DESC;
            """,
        )
        return self.db.execute(
            sql, {"num_package": num_package, "weight": weight, "vol": vol}
        )
