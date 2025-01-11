from typing import List, Type
from uuid import uuid4, UUID

from sqlalchemy import and_
from sqlalchemy.orm import Session

from repositories.base import BaseRepository
from schemas.merchant import MerchantSchema
from models.merchant import Merchant, MerchantCreate, MerchantUpdate


class MerchantRepository(
    BaseRepository[MerchantSchema, MerchantCreate, MerchantUpdate]
):
    def __init__(self, db: Session):
        super().__init__(db, MerchantSchema)

    def get_by_id(self, id: UUID) -> MerchantSchema | None:
        return (
            self.db.query(self.model).filter(and_(self.model.account_id == id)).first()
        )

    def create(self, schema: MerchantCreate) -> MerchantSchema:
        db_object = MerchantSchema(**schema.model_dump())

        self.db.add(db_object)
        self.db.commit()
        self.db.refresh(db_object)
        return db_object
