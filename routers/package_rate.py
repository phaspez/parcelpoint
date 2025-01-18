from uuid import UUID

from fastapi import APIRouter, HTTPException

from dependencies import PackageRateRepoDep
from models.package_rate import PackageRateUpdate, PackageRateCreate

router = APIRouter(
    prefix="/package_rate",
    tags=["package_rate"],
)


@router.get("/")
async def get_package_rate(package_rate_repo: PackageRateRepoDep):
    return package_rate_repo.get_all()


@router.get("/{id}")
async def get_package_rate_by_id(id: UUID, package_rate_repo: PackageRateRepoDep):
    package_rate = package_rate_repo.get_by_id(id)
    if not package_rate:
        raise HTTPException(status_code=404, detail="package_rate not found")

    return package_rate


@router.post("/")
async def create_package_rate(
    package_rate: PackageRateCreate, package_rate_repo: PackageRateRepoDep
):
    try:
        res = package_rate_repo.create(package_rate)
        return res
    except Exception as e:
        return HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{id}")
async def delete_package_rate(id: UUID, package_rate_repo: PackageRateRepoDep):
    try:
        return package_rate_repo.delete(id)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


@router.patch("/{id}")
async def patch_package_rate(
    id: UUID, updated: PackageRateUpdate, package_rate_repo: PackageRateRepoDep
):
    try:
        return package_rate_repo.update(id, updated)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
