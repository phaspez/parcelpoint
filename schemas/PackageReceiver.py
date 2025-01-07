from pydantic import BaseModel


class PackageReceiver(BaseModel):
    name: str
    phone: str