from sqlalchemy import Column, String, ForeignKey, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from schemas.users.merchant import MerchantSchema
from schemas import Base
from schemas.address import AddressSchema
from schemas.order import OrderSchema
from schemas.package_rate import PackageRateSchema
from schemas.storage_block import StorageBlockSchema


class PackageSchema(Base):
    __tablename__ = "package"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True)

    merchant_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey(MerchantSchema.account_id),
        nullable=False,
    )
    block_id = Column(
        PostgresUUID(as_uuid=True), ForeignKey(StorageBlockSchema.id), nullable=True
    )
    order_id = Column(
        PostgresUUID(as_uuid=True), ForeignKey(OrderSchema.id), nullable=True
    )
    address_id = Column(
        PostgresUUID(as_uuid=True), ForeignKey(AddressSchema.id), nullable=False
    )

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

    package_rate_id = Column(
        PostgresUUID(as_uuid=True), ForeignKey(PackageRateSchema.id), nullable=False
    )
    shipping_cost = Column(Float)
    cod_cost = Column(Float)
