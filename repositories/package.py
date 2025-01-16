from typing import List, Type
from uuid import uuid4, UUID

from sqlalchemy import and_
from sqlalchemy.orm import Session

from models.package import PackageCreate, PackageUpdate
from repositories.base import BaseRepository
from schemas.merchant import MerchantSchema
from models.merchant import Merchant, MerchantCreate, MerchantUpdate
from schemas.package import PackageSchema


class PackageRepository(BaseRepository[PackageSchema, PackageCreate, PackageUpdate]):
    def __init__(self, db: Session):
        super().__init__(db, MerchantSchema)

    def create(self, package: PackageCreate) -> Merchant:
        return super().create(package)
