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


@router.get("/search")
async def search_address(q: str, address_repo: AddressRepoDep):
    if not q:
        return address_repo.get_all()

    terms = [term.strip().lower() for term in q.split() if term.strip()]

    if not terms:
        return address_repo.get_all()

    results = address_repo.search(terms)

    return [
        {
            "id": str(row.id),
            "province": row.province,
            "district": row.district,
            "commune": row.commune,
            "matched_fields": [
                field
                for field in ["province", "district", "commune"]
                if any(term in getattr(row, field).lower() for term in terms)
            ],
        }
        for row in results
    ]


@router.get("/{id}")
async def get_address_by_id(id: UUID, address_repo: AddressRepoDep):
    return address_repo.get_by_id(id)


@router.post("/")
async def create_address(
    address: Annotated[AddressCreate, Body],
    address_repo: AddressRepoDep,
):
    return address_repo.create(address)


@router.delete("/{id}")
async def delete_address(id: UUID, address_repo: AddressRepoDep):
    return address_repo.delete(id)


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
