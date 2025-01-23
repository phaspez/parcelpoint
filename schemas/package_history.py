from sqlalchemy import Column, String, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID

from schemas import Base
from schemas.package import PackageSchema
from schemas.users import StaffSchema


class PackageHistorySchema(Base):
    __tablename__ = "packagehistory"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True)

    package_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey(PackageSchema.id),
        nullable=False,
        unique=False,
    )
    staff_id = Column(
        PostgresUUID(as_uuid=True), ForeignKey(StaffSchema.account_id), nullable=True
    )

    action = Column(String)
    notes = Column(String)
    timestamp = Column(DateTime, default=func.now())
