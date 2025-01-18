from sqlalchemy.orm import Session

from models.package_rate import PackageRateCreate, PackageRateUpdate
from repositories.base import BaseRepository
from schemas.package_rate import PackageRateSchema


class PackageRateRepository(
    BaseRepository[PackageRateSchema, PackageRateCreate, PackageRateUpdate]
):
    def __init__(self, db: Session):
        super().__init__(db, PackageRateSchema)
