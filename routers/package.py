from uuid import UUID
from fastapi import APIRouter, HTTPException
from models.package import PackageCreate, PackageUpdate, Package
from dependencies import PackageRepoDep


router = APIRouter(
    prefix="/package",
    tags=["package"],
)


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


@router.patch("/{id}")
async def patch_package(
    id: UUID, package_patched: PackageUpdate, package_repo: PackageRepoDep
) -> Package:
    try:
        updated = package_repo.update(id, package_patched)
        return Package(**updated.__dict__)
    except ValueError as e:
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
