from sqlalchemy import Column, String, Float, Integer
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID

from schemas import Base


class StorageBlockSchema(Base):
    __tablename__ = "storageblock"

    id = Column(
        PostgresUUID(as_uuid=True),
        primary_key=True,
    )
    name = Column(String)
    max_weight = Column(Float)
    max_size = Column(Float)
    max_package = Column(Integer)
