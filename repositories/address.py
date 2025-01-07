from typing import List, Type
from uuid import uuid4, UUID
from sqlalchemy.orm import Session

from repositories.base import BaseRepository
from schemas.address import AddressSchema
from models.address import AddressCreate, Address, AddressUpdate


class AddressRepository(BaseRepository[AddressSchema, AddressCreate, AddressUpdate]):
    def __init__(self, db: Session):
        super().__init__(db, AddressSchema)
