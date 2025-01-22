from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.sql.functions import func

from models.order import OrderCreate, OrderUpdate
from repositories.base import BaseRepository
from schemas.order import OrderSchema
from schemas.package import PackageSchema


class OrderRepository(BaseRepository[OrderSchema, OrderCreate, OrderUpdate]):
    def __init__(self, db: Session):
        super().__init__(db, OrderSchema)

    def get_by_merchant_id(self, id: UUID):
        query = (
            select(OrderSchema, func.count(PackageSchema.id))
            .join(PackageSchema, OrderSchema.id == PackageSchema.order_id)
            .where(OrderSchema.merchant_id == id)
            .group_by(OrderSchema.id)
            .order_by(OrderSchema.date)
        )

        results = self.db.execute(query).all()
        orders = []
        for order, count in results:
            order_dict = order.__dict__
            order_dict["count"] = count
            orders.append(order_dict)
        return orders
