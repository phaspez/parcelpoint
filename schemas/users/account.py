from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from schemas.address import AddressSchema
from schemas import Base


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
    google_id = Column(String, unique=True, nullable=True)
