from uuid import uuid4, UUID

from sqlalchemy import select, desc, delete
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

    def get_history_by_package_id(self, package_id: UUID) -> list[PackageHistorySchema]:
        query = (
            select(PackageHistorySchema)
            .where(PackageHistorySchema.package_id == package_id)
            .order_by(desc(PackageHistorySchema.timestamp))
        )

        result = list(self.db.execute(query).scalars().all())
        return result

    def delete_all_by_package_id(self, package_id: UUID):
        query = delete(PackageHistorySchema).where(
            PackageHistorySchema.package_id == package_id
        )

        self.db.execute(query)
        self.db.commit()
