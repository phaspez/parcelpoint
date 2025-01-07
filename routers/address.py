from typing import Annotated

from fastapi import APIRouter, HTTPException
from fastapi.params import Depends, Body
from sqlalchemy.orm import Session
from uuid import UUID
from connection import get_db
from repositories.address import AddressRepository
from models.address import AddressCreate, AddressUpdate

router = APIRouter(
    prefix="/address",
    tags=["address"],
)


def get_address_repository(db: Session = Depends(get_db)) -> AddressRepository:
    return AddressRepository(db)


@router.get("/")
async def get_address(
    address_repo: AddressRepository = Depends(get_address_repository),
):
    addresses = address_repo.get_all()
    return addresses


@router.get("/{id}")
async def get_address(
    id: UUID, address_repo: AddressRepository = Depends(get_address_repository)
):
    address = address_repo.get_by_id(id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    return address


@router.post("/")
async def create_address(
    address: Annotated[AddressCreate, Body],
    address_repo: AddressRepository = Depends(get_address_repository),
):
    try:
        res = address_repo.create(address)
        return res
    except Exception as e:
        return HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{id}")
async def delete_address(id: UUID, db: AddressRepository = Depends(get_db)):
    try:
        address_repo = AddressRepository(db)
        return address_repo.delete_by_id(id)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


@router.patch("/{id}")
async def patch_address(
    id: UUID,
    updated: Annotated[AddressUpdate, Body()],
    address_repo: AddressRepository = Depends(get_address_repository),
):
    try:
        return address_repo.patch_address_by_id(id, updated)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
