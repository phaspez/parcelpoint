from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID

from schemas import Base


class AddressSchema(Base):
    __tablename__ = "address"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True)
    province = Column(String)
    district = Column(String)
    commune = Column(String)
