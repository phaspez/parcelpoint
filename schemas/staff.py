from sqlalchemy import Column, String, ForeignKey, Float, Boolean, Integer, Date
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from schemas.merchant import MerchantSchema
from schemas.account import AccountSchema
from . import Base


class StaffSchema(Base):
    __tablename__ = "staff"

    account_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey(AccountSchema.id),
        nullable=False,
        primary_key=True,
    )
    position = Column(String, nullable=True)
    department = Column(String, nullable=False)
    hire_date = Column(Date, nullable=False)
    access_level = Column(Integer, default=0, nullable=False)
