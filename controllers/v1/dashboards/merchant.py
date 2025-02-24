from uuid import UUID

from fastapi import APIRouter, HTTPException
from fastapi.params import Query
from pyexpat.errors import messages

from dependencies import MerchantRepoDep, AccountRepoDep, PackageRepoDep, LoggedInDep

router = APIRouter(
    prefix="/dashboard",
    tags=["merchant-dashboard"],
)


@router.get("/package_per_day")
async def package_per_day(
    current_user: LoggedInDep,
    package_repo: PackageRepoDep,
    days_ago: int = Query(default=30, gt=0, lt=40),
):
    try:
        user = current_user
        if user.type != "MERCHANT":
            raise HTTPException(
                status_code=401,
                detail="You must me a merchant to view this, for staff, please use other route",
            )

        return package_repo.query_package_days_ago(user.id, days_ago)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
