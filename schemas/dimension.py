from pydantic import BaseModel

class Dimension(BaseModel):
    width: float
    length: float
    height: float