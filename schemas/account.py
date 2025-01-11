from uuid import UUID
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import foreign, relationship, declarative_base
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
