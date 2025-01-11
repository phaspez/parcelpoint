from uuid import UUID
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import declarative_base

from schemas.account import AccountSchema

Base = declarative_base()


class MerchantSchema(Base):
    __tablename__ = "merchant"

    account_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey(AccountSchema.id),
        nullable=False,
        primary_key=True,
    )
    company_name = Column(String)
    merchant_description = Column(String)
    registration_date = Column(String)
