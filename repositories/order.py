from datetime import datetime, time
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select, desc, and_, cast, TIMESTAMP, Date
from sqlalchemy.orm import Session
from sqlalchemy.sql.functions import func

from models.order import OrderCreate, OrderUpdate
from models.pagination import Pagination
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

    def _build_base_order_query(self, merchant_id: Optional[UUID] = None):
        """Build the base query for orders with package count."""
        query = select(OrderSchema, func.count(PackageSchema.id)).join(
            PackageSchema, OrderSchema.id == PackageSchema.order_id
        )

        if merchant_id:
            query = query.where(OrderSchema.merchant_id == merchant_id)

        return query.group_by(OrderSchema.id).order_by(desc(OrderSchema.date))

    def _execute_paginated_query(
        self, base_query, count_query, page: int = 1, page_size: int = 10
    ) -> Pagination[dict]:
        """Execute paginated query and return paginated results."""
        # Get total count
        total_items = self.db.execute(count_query).scalar() or 0

        # Calculate pagination
        offset = (page - 1) * page_size
        paginated_query = base_query.offset(offset).limit(page_size)

        # Execute query
        results = self.db.execute(paginated_query).all()

        # Process results
        items = []
        for result in results:
            if len(result) == 2:  # Order and count
                order, count = result
                item_dict = order.__dict__
                item_dict["count"] = count
            elif len(result) == 3:  # Order, customer name, and count
                order, customer, count = result
                item_dict = order.__dict__
                item_dict["customer"] = customer
                item_dict["count"] = count

            if "_sa_instance_state" in item_dict:
                del item_dict["_sa_instance_state"]

            items.append(item_dict)

        # Build pagination info
        page_count = (total_items + page_size - 1) // page_size
        previous_page = page - 1 if page > 1 else None
        next_page = page + 1 if page < page_count else None

        return Pagination[dict](
            current_page=page,
            page_count=page_count,
            items=total_items,
            previous=previous_page,
            next=next_page,
            data=items,
        )

    def get_all_paginated(self, page: int = 1, page_size: int = 10):
        """Get all orders with pagination."""
        base_query = self._build_base_order_query()

        count_query = select(func.count()).select_from(
            select(OrderSchema.id)
            .join(PackageSchema, OrderSchema.id == PackageSchema.order_id)
            .group_by(OrderSchema.id)
            .subquery()
        )

        return self._execute_paginated_query(base_query, count_query, page, page_size)

    def get_by_merchant_id_paginated(
        self, id: UUID, page: int = 1, page_size: int = 10
    ):
        """Get orders for a specific merchant with pagination."""
        base_query = self._build_base_order_query(merchant_id=id)

        count_query = select(func.count()).select_from(
            select(OrderSchema.id)
            .join(PackageSchema, OrderSchema.id == PackageSchema.order_id)
            .where(OrderSchema.merchant_id == id)
            .group_by(OrderSchema.id)
            .subquery()
        )

        return self._execute_paginated_query(base_query, count_query, page, page_size)

    def query_order_range(self, start_date: datetime, end_date: datetime):
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
