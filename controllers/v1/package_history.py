from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, HTTPException

from dependencies import PackageHistoryRepoDep
from models.package_history import PackageHistoryCreate

router = APIRouter(
    prefix="/history",
    tags=["package_history"],
)


@router.post("/")
async def create_history(
    package_history_create: PackageHistoryCreate,
    package_history_repo: PackageHistoryRepoDep,
):
    try:
        print(package_history_create)
        return package_history_repo.create(package_history_create)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}")
async def get_history_of_package(id: UUID, package_history_repo: PackageHistoryRepoDep):
    try:
        return package_history_repo.get_history_by_package_id(id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
