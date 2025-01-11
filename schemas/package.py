from uuid import UUID
from sqlalchemy import Column, String, ForeignKey, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.ext.declarative import declarative_base

from schemas.account import AccountSchema
from schemas.merchant import MerchantSchema

Base = declarative_base()


class PackageSchema(Base):
    __tablename__ = "package"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True)

    merchant_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey(MerchantSchema.account_id),
        nullable=False,
        primary_key=True,
    )
    block_id = Column(PostgresUUID(as_uuid=True), nullable=True)
    address_id = Column(PostgresUUID(as_uuid=True), nullable=False)

    description = Column(String)
    street = Column(String)
    name = Column(String)
    phone = Column(String)

    width = Column(Float)
    height = Column(Float)
    length = Column(Float)
    weight = Column(Float)

    is_fragile = Column(Boolean)
    is_urgent = Column(Boolean)

    status = Column(String)

    shipping_cost = Column(Float)
    cod_cost = Column(Float)
