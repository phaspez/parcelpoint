from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from schemas.users.account import AccountSchema
from schemas import Base


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
