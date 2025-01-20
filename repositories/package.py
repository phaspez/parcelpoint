from datetime import timedelta, datetime
from uuid import UUID

from sqlalchemy import and_, desc, cast, Date, func, Integer, text
from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import Session

from models.package import PackageCreate, PackageUpdate
from repositories.base import BaseRepository
from repositories.package_rate import PackageRateRepository
from repositories.storage_block import StorageBlockRepository
from schemas.order import OrderSchema
from schemas.package import PackageSchema
from seedings.package_rate import oversize_rate


def satisfy_metric(volume, height):
    if volume <= 0 or height <= 0:
        raise ValueError("Volume and height must be larger than 0.0")


class PackageRepository(BaseRepository[PackageSchema, PackageCreate, PackageUpdate]):
    def __init__(self, db: Session):
        super().__init__(db, PackageSchema)
        self.storage_block = StorageBlockRepository(db)
        self.package_rate = PackageRateRepository(db)

    def query_packages(
        self,
        merchant_id: UUID | None = None,
        block_id: UUID | None = None,
        order_id: UUID | None = None,
        is_urgent: bool | None = None,
        is_fragile: bool | None = None,
        min_weight: float | None = None,
        max_weight: float | None = None,
        days_ago: int = 30,
        limit: int = 20,
        offset: int = 0,
    ):
        query = self.db.query(PackageSchema).join(OrderSchema)

        filters = []
        if merchant_id:
            filters.append(PackageSchema.merchant_id == merchant_id)
        if order_id:
            filters.append(PackageSchema.order_id == order_id)
        if block_id:
            filters.append(PackageSchema.block_id == block_id)
        if is_urgent is not None:
            filters.append(PackageSchema.is_urgent == is_urgent)
        if is_fragile is not None:
            filters.append(PackageSchema.is_fragile == is_fragile)
        if min_weight is not None:
            filters.append(PackageSchema.weight >= min_weight)
        if max_weight is not None:
            filters.append(PackageSchema.weight <= max_weight)

        if days_ago is not None:
            date_threshold = datetime.now() - timedelta(days=days_ago)
            filters.append(OrderSchema.date >= date_threshold)

        if filters:
            print(filters)
            query = query.filter(and_(*filters))

        print(
            query.statement.compile(
                dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True}
            )
        )
        query = query.order_by(desc(OrderSchema.date))
        packages = query.offset(offset).limit(limit).all()
        return packages

    def query_package_days_ago(self, id: UUID, days_ago: int = 5):
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days_ago - 1)

        # Generate series of dates
        date_series = self.db.query(
            func.generate_series(
                cast(start_date, Date),
                cast(end_date, Date),
                text("interval '1 day'"),  # Fixed: proper interval syntax
            ).label("date")
        ).subquery()

        # Count packages per day
        package_counts = (
            self.db.query(
                cast(OrderSchema.date, Date).label("date"),
                func.count(PackageSchema.id).label("count"),
            )
            .join(PackageSchema, PackageSchema.id == PackageSchema.id)
            .where(PackageSchema.merchant_id == id)
            .group_by(cast(OrderSchema.date, Date))
            .filter(OrderSchema.date >= start_date, OrderSchema.date <= end_date)
            .subquery()
        )

        # Join dates with counts, using COALESCE to convert NULL to 0
        final_query = (
            self.db.query(
                date_series.c.date,
                func.coalesce(package_counts.c.count, 0).label("count"),
            )
            .outerjoin(package_counts, date_series.c.date == package_counts.c.date)
            .order_by(date_series.c.date)
        )

        daily_counts = [
            {"date": result.date, "count": result.count} for result in final_query.all()
        ]
        # daily = [date[0] for date in daily_counts]
        # counts = [count[1] for count in daily_counts]

        # return {"dates": daily, "counts": counts}
        return daily_counts

    def calculate_package_pricing(self, package: PackageCreate) -> float:
        rate = self.package_rate.get_by_id(package.package_rate_id)
        # 50000 cm3 standard base for oversize
        oversize = package.length * package.width * package.height - 50000
        overweight = int(package.weight - rate.base_weight)
        urgent = rate.urgent_rate if package.is_urgent else 0
        fragile = rate.fragile_rate if package.is_fragile else 0

        total_fee = (
            rate.base_rate
            + urgent
            + fragile
            + (rate.oversize_rate if oversize > 0 else 0)
            + (overweight * rate.overweight_rate_per_kg if overweight > 0 else 0)
        )

        return total_fee

    def refresh_package_pricing(self, id: UUID):
        package = self.get_by_id(id)
        if not package:
            raise ValueError(f"Package {id} not found")
        cod_cost = self.calculate_package_pricing(PackageCreate(**package.__dict__))
        return self.update(id, PackageUpdate(cod_cost=cod_cost))

    def create(self, package: PackageCreate) -> PackageSchema:
        package.shipping_cost = self.calculate_package_pricing(package)
        block_id = package.block_id

        if block_id:
            volume = package.width * package.height * package.length
            weight = package.weight
            satisfy_metric(volume, weight)
            is_exceed_limit = self.storage_block.check_if_exceed_limit(
                volume, weight, block_id
            )
            if is_exceed_limit:
                self.db.rollback()
                raise ValueError(
                    "Either volume, weight or max count exceeded the limit of the block"
                )

        return super().create(package)

    def update(self, id: UUID, package_updated: PackageUpdate) -> PackageSchema | None:
        if not package_updated.block_id:
            return super().update(id, package_updated)

        package = self.get_by_id(id)

        if not package:
            self.db.rollback()
            raise ValueError(f"Package {id} not found")

        if (
            package_updated.package_rate_id
            and package_updated.package_rate_id != package.package_rate_id
        ):
            cod_cost = self.calculate_package_pricing(PackageCreate(**package.__dict__))
            package_updated.cod_cost = cod_cost

        volume = (
            (package_updated.width if package_updated.width else package.width)
            * (package_updated.height if package_updated.height else package.height)
            * (package_updated.length if package_updated.length else package.length)
        )

        weight = package_updated.weight if package_updated.weight else package.weight

        is_exceed_limit = self.storage_block.check_if_exceed_limit(
            volume, weight, package_updated.block_id, exclude_package=id
        )

        if is_exceed_limit:
            self.db.rollback()
            raise ValueError(
                "Either volume, weight or max count exceeded the limit of the block"
            )

        return super().update(id, package_updated)
