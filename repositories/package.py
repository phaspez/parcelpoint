from uuid import UUID

from sqlalchemy.orm import Session

from models.package import PackageCreate, PackageUpdate
from repositories.base import BaseRepository
from repositories.storage_block import StorageBlockRepository
from schemas.package import PackageSchema


class PackageRepository(BaseRepository[PackageSchema, PackageCreate, PackageUpdate]):
    def __init__(self, db: Session):
        super().__init__(db, PackageSchema)
        self.storage_block = StorageBlockRepository(db)

    def create(self, package: PackageCreate) -> PackageSchema:
        block_id = package.block_id
        if block_id:
            volume = package.width * package.height * package.length
            weight = package.weight
            is_exceed_limit = self.storage_block.check_if_exceed_limit(
                volume, weight, block_id
            )
            if is_exceed_limit:
                raise ValueError(
                    "Either volume, weight or max count exceeded the limit of the block"
                )

        return super().create(package)

    def update(self, id: UUID, package_updated: PackageUpdate) -> PackageSchema | None:
        if package_updated.block_id:
            package = self.get_by_id(id)
            volume = (
                (package.width or package_updated.width)
                * (package.height or package_updated.height)
                * (package.length or package_updated.length)
            )
            weight = package.weight or package_updated.weight
            is_exceed_limit = self.storage_block.check_if_exceed_limit(
                volume, weight, package_updated.block_id
            )
            if is_exceed_limit:
                raise ValueError(
                    "Either volume, weight or max count exceeded the limit of the block"
                )

        return super().update(id, package_updated)
