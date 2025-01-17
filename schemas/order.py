from sqlalchemy import Column, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from schemas.users.merchant import MerchantSchema
from . import Base


class OrderSchema(Base):
    __tablename__ = "order"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True)

    merchant_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey(MerchantSchema.account_id),
        nullable=False,
    )
    staff_id = Column(
        PostgresUUID(as_uuid=True),
    )
    date = Column(DateTime, nullable=False)
    details = Column(Text, nullable=True)
