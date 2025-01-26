from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, HTTPException
from fastapi.params import Query
from pyexpat.errors import messages

from dependencies import (
    MerchantRepoDep,
    AccountRepoDep,
    PackageRepoDep,
    LoggedInDep,
    OrderRepoDep,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["staff-dashboard"],
)


@router.get("/overview")
async def get_overview(
    current_user: LoggedInDep,
    package_repo: PackageRepoDep,
    order_repo: OrderRepoDep,
    start_date: datetime,
    end_date: datetime,
):
    try:
        user = current_user
        if user.type != "STAFF":
            raise HTTPException(
                status_code=401,
                detail="You must me a staff member to view this",
            )

        recent_packages = package_repo.query_packages(
            min_date=start_date, max_date=end_date, limit=10000
        )
        orders = order_repo.query_order_range(start_date=start_date, end_date=end_date)

        return {"recent_packages": recent_packages, "orders": orders}
        # return package_repo.query_package_days_ago(user.id, days_ago)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
