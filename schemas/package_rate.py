from sqlalchemy import Column, String, Float
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID

from . import Base


class PackageRateSchema(Base):
    __tablename__ = "packagerate"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True)

    name = Column(String)
    base_rate = Column(Float)
    base_weight = Column(Float)
    oversize_rate = Column(Float)
    overweight_rate_per_kg = Column(Float)
    fragile_rate = Column(Float)
    urgent_rate = Column(Float)
