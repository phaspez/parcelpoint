from uuid import UUID

from sqlalchemy import and_
from sqlalchemy.orm import Session

from models.users.staff import StaffCreate, StaffUpdate
from repositories.base import BaseRepository
from schemas.users.staff import StaffSchema


class StaffRepository(BaseRepository[StaffSchema, StaffCreate, StaffUpdate]):
    def __init__(self, db: Session):
        super().__init__(db, StaffSchema)

    def get_by_id(self, id: UUID) -> StaffSchema | None:
        return (
            self.db.query(self.model).filter(and_(self.model.account_id == id)).first()
        )

    def create(self, schema: StaffCreate) -> StaffSchema:
        db_object = StaffSchema(**schema.model_dump())

        self.db.add(db_object)
        self.db.commit()
        self.db.refresh(db_object)
        return db_object
