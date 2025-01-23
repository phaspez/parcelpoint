from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, HTTPException
from fastapi.params import Body

from dependencies import AddressRepoDep, PackageHistoryRepoDep
from models.address import AddressCreate, AddressUpdate

router = APIRouter(
    prefix="/history",
    tags=["package_history"],
)


@router.get("/{id}")
async def get_history_of_package(id: UUID, package_history_repo: PackageHistoryRepoDep):
    try:
        return package_history_repo.get_history_by_package_id(id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
