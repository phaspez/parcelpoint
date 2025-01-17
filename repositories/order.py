from sqlalchemy.orm import Session

from models.order import OrderCreate, OrderUpdate
from repositories.base import BaseRepository
from schemas.order import OrderSchema


class OrderRepository(BaseRepository[OrderSchema, OrderCreate, OrderUpdate]):
    def __init__(self, db: Session):
        super().__init__(db, OrderSchema)
