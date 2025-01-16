from typing import List, Type
from uuid import uuid4, UUID

from sqlalchemy import and_, text
from sqlalchemy.orm import Session

from models.storage_block import StorageBlockCreate, StorageBlockUpdate
from repositories.base import BaseRepository
from schemas.storage_block import StorageBlockSchema
from scripts.block_constrain import block_constrain


class StorageBlockRepository(
    BaseRepository[StorageBlockSchema, StorageBlockCreate, StorageBlockUpdate]
):
    def __init__(self, db: Session):
        super().__init__(db, StorageBlockSchema)

        trigger_exists = db.execute(
            text(
                """
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.triggers 
                WHERE trigger_name = 'enforce_block_capacity'
            );
        """
            )
        ).scalar()
        if not trigger_exists:
            db.execute(block_constrain)
            db.commit()
