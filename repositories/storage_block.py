from uuid import UUID

from sqlalchemy import and_, text, func, select
from sqlalchemy.orm import Session

from models.package import Package
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

    def check_if_exceed_limit(
        self, volume, weight, block_id: UUID | None, exclude_package: UUID | None = None
    ) -> bool:
        # sometimes you might need to check a package already in a block if modify it exceed limit, in that case
        # pass its id to exclude

        sql = text(
            """
            SELECT max_weight, max_size, max_package 
            FROM parcelpoint.public.storageblock
            WHERE storageblock.id = :id
        """
        )
        result = self.db.execute(sql, {"id": block_id}).fetchone()
        max_weight, max_size, max_package = result

        if exclude_package:
            sql_package = text(
                """SELECT width, height, length, weight FROM parcelpoint.public.package WHERE id = :id"""
            )
            result_package = self.db.execute(
                sql_package, {"id": exclude_package}
            ).fetchone()
            exclude_vol = result_package[0] * result_package[1] * result_package[2]
            exclude_weight = result_package[3]
            max_weight += exclude_weight
            max_size += exclude_vol
            max_package += 1

        if self.get_sum_weight(block_id) + weight > max_weight:
            return True
        if self.get_sum_size(block_id) + volume > max_size:
            return True
        return self.get_sum_count(block_id) + 1 > max_package

    def get_storage_block_within_limits(
        self, package: UUID, vol: float, weight: float, num_package: int = 1
    ):
        sql = text(
            """
            SELECT sb.*
            FROM parcelpoint.public.storageblock sb
            LEFT JOIN parcelpoint.public.package p ON sb.id = p.block_id
            WHERE sb.id != :package_id
            GROUP BY sb.id, sb.max_package, sb.max_weight, sb.max_size
            HAVING 
                (sb.max_package >= (COUNT(p.id) + :num_package))
                AND (sb.max_weight >= (COALESCE(SUM(p.weight), 0) + :weight))
                AND (sb.max_size >= (COALESCE(SUM(p.width * p.length * p.height), 0) + :vol))
            ORDER BY 
                (sb.max_weight - COALESCE(SUM(p.weight), 0)) DESC,
                (sb.max_size - COALESCE(SUM(p.width * p.length * p.height), 0)) DESC;
            """,
        )
        return self.db.execute(
            sql,
            {
                "package_id": package,
                "num_package": num_package,
                "weight": weight,
                "vol": vol,
            },
        )

    def get_storage_block_under_capacity(
        self, volume: float, weight: float, num_package: int
    ):
        sql = text(
            """
            SELECT sb.*
            FROM parcelpoint.public.storageblock sb
            LEFT JOIN parcelpoint.public.package p ON sb.id = p.block_id
            WHERE (sb.max_package < :num) AND (sb.max_weight < :weight) AND (sb.max_size < :vol)
            GROUP BY sb.id, sb.max_package, sb.max_weight, sb.max_size
        """
        )

        return self.db.execute(
            sql, {"num": num_package, "weight": weight, "vol": volume}
        )

    def get_all(self):
        query = (
            select(
                StorageBlockSchema,
                func.sum(func.coalesce(PackageSchema.weight, 0)).label(
                    "current_weight"
                ),
                func.sum(
                    func.coalesce(
                        PackageSchema.width
                        * PackageSchema.height
                        * PackageSchema.length,
                        0,
                    )
                ).label("current_size"),
            )
            .outerjoin(PackageSchema, StorageBlockSchema.id == PackageSchema.block_id)
            .group_by(
                StorageBlockSchema.id,
            )
        )

        result = self.db.execute(query).all()
        storage_blocks = []
        for block, weight, size in result:
            storage_block = block.__dict__
            storage_block["weight"] = weight
            storage_block["size"] = size
            storage_blocks.append(storage_block)

        return storage_blocks
