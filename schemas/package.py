from datetime import datetime

from fastapi.params import Body
from pydantic import BaseModel, Field
from typing_extensions import Literal

from schemas.PackageReceiver import PackageReceiver
from schemas.dimension import Dimension
from typing import Annotated

class PackageIn(BaseModel):
    id: Annotated[str, Body(description="Unique identifier")]
    dimension: Annotated[Dimension, Body(description="Dimension measurements in centimeters")]
    receiver: PackageReceiver | None = None
    weight: Annotated[float, Body(description="Weight in kilogram", lt=0)]
    contents: str
    fragile: bool = False

class Package(BaseModel):
    id: str
    dimension: Dimension
    weight: float
    contents: str
    status: Literal['CREATED', 'IN STOCK', 'DELIVERING', 'RETURNING', 'DAMAGED'] = 'CREATED'
    receiver: PackageReceiver | None = None
    created_at: datetime = Field(default_factory=datetime.now)
    fragile: bool = False

class PackageOut(BaseModel):
    id: str
    dimension: Dimension
    weight: float
    contents: str
    status: Literal['CREATED', 'DELIVERING', 'RETURNING']
    created_at: datetime = Field(default_factory=datetime.now)
    receiver: PackageReceiver | None = None
    fragile: bool = False
