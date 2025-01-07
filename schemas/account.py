from uuid import UUID
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import foreign, relationship
from sqlalchemy.testing.schema import mapped_column

from schemas.address import AddressSchema

Base = declarative_base()


class AccountSchema(Base):
    __tablename__ = "account"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True)
    name = Column(String)
    hashed_password = Column(String)
    phone = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    address_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey(AddressSchema.id),
        nullable=False,
    )
    street = Column(String)
    # address_id = mapped_column(ForeignKey(AddressSchema.id))
    # address = relationship()

    # address = relationship("address", foreign_keys="account.address_id")
