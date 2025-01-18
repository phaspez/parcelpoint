from multiprocessing.managers import Value
from uuid import UUID

from sqlalchemy.orm import Session

from models.package import PackageCreate, PackageUpdate
from repositories.base import BaseRepository
from repositories.package_rate import PackageRateRepository
from repositories.storage_block import StorageBlockRepository
from schemas.package import PackageSchema
from seedings.package_rate import oversize_rate


def satisfy_metric(volume, height):
    if volume <= 0 or height <= 0:
        raise ValueError("Volume and height must be larger than 0.0")


class PackageRepository(BaseRepository[PackageSchema, PackageCreate, PackageUpdate]):
    def __init__(self, db: Session):
        super().__init__(db, PackageSchema)
        self.storage_block = StorageBlockRepository(db)
        self.package_rate = PackageRateRepository(db)

    def calculate_package_pricing(self, package: PackageCreate) -> float:
        rate = self.package_rate.get_by_id(package.package_rate_id)
        # 50000 cm3 standard base for oversize
        oversize = package.length * package.width * package.height - 50000
        overweight = int(package.weight - rate.base_weight)
        urgent = rate.urgent_rate if package.is_urgent else 0
        fragile = rate.fragile_rate if package.is_fragile else 0

        total_fee = (
            rate.base_rate
            + urgent
            + fragile
            + (rate.oversize_rate if oversize > 0 else 0)
            + (overweight * rate.overweight_rate_per_kg if overweight > 0 else 0)
        )

        return total_fee

    def refresh_package_pricing(self, id: UUID):
        package = self.get_by_id(id)
        if not package:
            raise ValueError(f"Package {id} not found")
        cod_cost = self.calculate_package_pricing(PackageCreate(**package.__dict__))
        return self.update(id, PackageUpdate(cod_cost=cod_cost))

    def create(self, package: PackageCreate) -> PackageSchema:
        package.shipping_cost = self.calculate_package_pricing(package)
        block_id = package.block_id

        if block_id:
            volume = package.width * package.height * package.length
            weight = package.weight
            satisfy_metric(volume, weight)
            is_exceed_limit = self.storage_block.check_if_exceed_limit(
                volume, weight, block_id
            )
            if is_exceed_limit:
                raise ValueError(
                    "Either volume, weight or max count exceeded the limit of the block"
                )

        return super().create(package)

    def update(self, id: UUID, package_updated: PackageUpdate) -> PackageSchema | None:
        if not package_updated.block_id:
            return super().update(id, package_updated)

        package = self.get_by_id(id)

        if not package:
            raise ValueError(f"Package {id} not found")

        volume = (
            (package.width or package_updated.width)
            * (package.height or package_updated.height)
            * (package.length or package_updated.length)
        )

        weight = package.weight or package_updated.weight

        satisfy_metric(volume, weight)
        is_exceed_limit = self.storage_block.check_if_exceed_limit(
            volume, weight, package_updated.block_id
        )

        if is_exceed_limit:
            raise ValueError(
                "Either volume, weight or max count exceeded the limit of the block"
            )

        return super().update(id, package_updated)
