from uuid import UUID
from sqlalchemy import Column, String, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.ext.declarative import declarative_base

from schemas.account import AccountSchema

Base = declarative_base()


class StorageBlockSchema(Base):
    __tablename__ = "storageblock"

    id = Column(
        PostgresUUID(as_uuid=True),
        primary_key=True,
    )
    name = Column(String)
    max_weight = Column(Float)
    max_size = Column(Float)
