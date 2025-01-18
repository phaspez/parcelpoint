from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, HTTPException
from fastapi.params import Body

from dependencies import AddressRepoDep
from models.address import AddressCreate, AddressUpdate

router = APIRouter(
    prefix="/address",
    tags=["address"],
)


@router.get("/")
async def get_address(address_repo: AddressRepoDep):
    return address_repo.get_all()


@router.get("/{id}")
async def get_address_by_id(id: UUID, address_repo: AddressRepoDep):
    address = address_repo.get_by_id(id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    return address


@router.post("/")
async def create_address(
    address: Annotated[AddressCreate, Body],
    address_repo: AddressRepoDep,
):
    try:
        res = address_repo.create(address)
        return res
    except Exception as e:
        return HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{id}")
async def delete_address(id: UUID, address_repo: AddressRepoDep):
    try:
        return address_repo.delete(id)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


@router.patch("/{id}")
async def patch_address(
    id: UUID,
    updated: Annotated[AddressUpdate, Body()],
    address_repo: AddressRepoDep,
):
    try:
        return address_repo.update(id, updated)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
