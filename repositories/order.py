from datetime import datetime, time
from uuid import UUID

from sqlalchemy import select, desc, and_, cast, TIMESTAMP, Date
from sqlalchemy.orm import Session
from sqlalchemy.sql.functions import func

from models.order import OrderCreate, OrderUpdate
from repositories.base import BaseRepository
from schemas.order import OrderSchema
from schemas.package import PackageSchema
from schemas.users import MerchantSchema, AccountSchema


class OrderRepository(BaseRepository[OrderSchema, OrderCreate, OrderUpdate]):
    def __init__(self, db: Session):
        super().__init__(db, OrderSchema)

    def get_by_merchant_id(self, id: UUID):
        query = (
            select(OrderSchema, func.count(PackageSchema.id))
            .join(PackageSchema, OrderSchema.id == PackageSchema.order_id)
            .where(OrderSchema.merchant_id == id)
            .group_by(OrderSchema.id)
            .order_by(desc(OrderSchema.date))
        )

        results = self.db.execute(query).all()
        orders = []
        for order, count in results:
            order_dict = order.__dict__
            order_dict["count"] = count
            orders.append(order_dict)
        return orders

    def query_order_range(self, start_date: datetime, end_date: datetime):
        print(start_date)
        print(end_date)

        query = (
            select(
                OrderSchema, MerchantSchema.company_name, func.count(PackageSchema.id)
            )
            .join(MerchantSchema, OrderSchema.merchant_id == MerchantSchema.account_id)
            .join(PackageSchema, OrderSchema.id == PackageSchema.order_id)
            .where(
                cast(OrderSchema.date, Date) >= start_date,
                cast(OrderSchema.date, Date) <= end_date,
            )
            .group_by(OrderSchema.id, MerchantSchema.company_name)
            .order_by(desc(OrderSchema.date))
            .limit(20)
        )

        results = self.db.execute(query).all()

        orders = []
        for order, customer, count in results:
            order_dict = order.__dict__
            order_dict["customer"] = customer
            order_dict["count"] = count
            orders.append(order_dict)
        return orders
