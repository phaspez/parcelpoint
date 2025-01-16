from typing import Annotated

from fastapi import APIRouter, HTTPException
from fastapi.params import Depends, Body, Cookie
from sqlalchemy.orm import Session
from uuid import UUID

from connection import get_db
from models.storage_block import StorageBlockCreate, StorageBlockUpdate, StorageBlock
from repositories.storage_block import StorageBlockRepository


def get_storage_block_repository(
    db: Session = Depends(get_db),
) -> StorageBlockRepository:
    return StorageBlockRepository(db)


router = APIRouter(
    prefix="/storage_block",
    tags=["storage_block"],
)

StorageBlockDeps = Annotated[
    StorageBlockRepository, Depends(get_storage_block_repository)
]


@router.get("/")
async def get_storage_blocks(
    storage_block_repo: StorageBlockDeps,
):
    blocks = storage_block_repo.get_all()
    return blocks


@router.post("/")
async def create_block(
    block_create: StorageBlockCreate, storage_block_repo: StorageBlockDeps
):
    try:
        return storage_block_repo.create(block_create)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{id}")
async def patch_block(
    id: UUID, block_patched: StorageBlockUpdate, storage_block_repo: StorageBlockDeps
) -> StorageBlock:
    try:
        updated = storage_block_repo.update(id, block_patched)
        return StorageBlock(**updated.__dict__)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
async def delete_block(id: UUID, storage_block_repo: StorageBlockDeps) -> StorageBlock:
    try:
        deleted = storage_block_repo.delete(id)
        return StorageBlock(**deleted.__dict__)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}")
async def get_block(id: UUID, storage_block_repo: StorageBlockDeps) -> StorageBlock:
    block = storage_block_repo.get_by_id(id)
    if not block:
        raise HTTPException(status_code=404, detail="Account not found")
    return StorageBlock(**block.__dict__)
