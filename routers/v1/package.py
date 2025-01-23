from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from dependencies import PackageRepoDep, LoggedInDep
from models.package import PackageCreate, PackageUpdate, Package
import routers.v1.package_history as package_history

router = APIRouter(
    prefix="/package",
    tags=["package"],
)

router.include_router(package_history.router)


@router.get("/")
async def get_packages(
    package_repo: PackageRepoDep,
):
    return package_repo.get_all()


@router.post("/")
async def create_package(package_create: PackageCreate, package_repo: PackageRepoDep):
    try:
        return package_repo.create(package_create)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/v1/package/my_packages")
async def create_merchant_packages(user: LoggedInDep, package_repo: PackageRepoDep):
    pass


@router.get("/my_packages")
async def get_merchant_packages(
    package_repo: PackageRepoDep,
    user: LoggedInDep,
    merchant_id: UUID | None = None,
    block_id: UUID | None = None,
    order_id: UUID | None = None,
    is_urgent: bool | None = None,
    is_fragile: bool | None = None,
    min_weight: float | None = None,
    max_weight: float | None = None,
    days_ago: int = Query(7, gt=0),
    limit: int = Query(0, le=50),
    offset: int = Query(0, ge=0),
):
    try:
        results = package_repo.query_packages(
            merchant_id=user.id,
            block_id=block_id,
            order_id=order_id,
            is_urgent=is_urgent,
            is_fragile=is_fragile,
            min_weight=min_weight,
            max_weight=max_weight,
            days_ago=days_ago,
            limit=limit,
            offset=offset,
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{id}")
async def patch_package(
    id: UUID, package_patched: PackageUpdate, package_repo: PackageRepoDep
) -> Package:
    try:
        updated = package_repo.update(id, package_patched)
        return Package(**updated.__dict__)
    except ValueError as e:
        print(e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
async def delete_block(id: UUID, package_repo: PackageRepoDep) -> Package:
    try:
        deleted = package_repo.delete(id)
        return Package(**deleted.__dict__)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}")
async def get_package(id: UUID, package_repo: PackageRepoDep) -> Package:
    package = package_repo.get_by_id(id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    return Package(**package.__dict__)
