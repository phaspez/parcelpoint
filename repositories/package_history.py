from uuid import uuid4

from sqlalchemy import select, desc
from sqlalchemy.orm import Session

from models.package_history import (
    PackageHistoryUpdate,
    PackageHistory,
    PackageHistoryCreate,
)
from repositories.base import BaseRepository
from schemas.package_history import PackageHistorySchema


class PackageHistoryRepository(
    BaseRepository[PackageHistorySchema, PackageHistoryCreate, PackageHistoryUpdate]
):
    def __init__(self, db: Session):
        super().__init__(db, PackageHistorySchema)

    def get_history_by_package_id(self, package_id: int) -> list[PackageHistorySchema]:
        query = (
            select(PackageHistorySchema)
            .where(PackageHistorySchema.package_id == package_id)
            .order_by(desc(PackageHistorySchema.timestamp))
        )

        result = list(self.db.execute(query).scalars().all())
        return result
