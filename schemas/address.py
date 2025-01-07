from uuid import UUID
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class AddressSchema(Base):
    __tablename__ = "address"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True)
    province = Column(String)
    district = Column(String)
    commune = Column(String)
