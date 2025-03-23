from uuid import UUID

from fastapi import APIRouter, HTTPException

from dependencies import StaffRepoDep, AccountRepoDep, OrderRepoDep
from models.users.account import Account, AccountCreate, AccountUpdate
from models.users.staff import (
    Staff,
    StaffDetails,
    StaffCreate,
    StaffCreateNoID,
    StaffUpdate,
)
import controllers.v1.dashboards.staff as staff

router = APIRouter(
    prefix="/staff",
    tags=["staff"],
)

router.include_router(staff.router)


@router.get("/")
async def get_staff(staff_repo: StaffRepoDep):
    return staff_repo.get_all()


@router.post("/register")
async def register_staff(
    staff_create: StaffCreateNoID,
    account_create: AccountCreate,
    staff_repo: StaffRepoDep,
    account_repo: AccountRepoDep,
) -> StaffDetails:
    try:
        account = account_repo.create(account_create)
        account_model = Account(**account.__dict__)
        staff_model = StaffCreate(
            **staff_create.model_dump(),
            account_id=account.id,
        )
        staff = staff_repo.create(staff_model)

        return StaffDetails(account=account_model, **staff_model.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}")
async def get_staff_by_id(
    id: UUID,
    staff_repo: StaffRepoDep,
    account_repo: AccountRepoDep,
    is_detailed: bool = False,
):
    staff = staff_repo.get_by_id(id)

    if staff is None:
        raise HTTPException(status_code=404, detail="Staff not found")
    account = account_repo.get_by_id(id)
    if staff is None:
        raise HTTPException(
            status_code=500, detail="Staff found but user isn't, something's wrong"
        )

    staff_model = Staff(**staff.__dict__)
    if is_detailed:
        account_model = Account(**account.__dict__)
        return StaffDetails(account=account_model, **staff_model.model_dump())
    return staff_model


@router.patch("/{id}")
async def update_staff(
    id: UUID,
    staff_updated: StaffUpdate,
    account_updated: AccountUpdate,
    staff_repo: StaffRepoDep,
    account_repo: AccountRepoDep,
):
    staff = staff_updated.model_dump()
    account = account_updated.model_dump()
    if staff is None or account is None:
        raise HTTPException(status_code=404, detail="Merchant not found")

    try:
        account_model = account_repo.update(id, account_updated)
        staff_model = staff_repo.update(id, staff_updated)

        if account_model is None:
            raise HTTPException(
                status_code=500,
                detail="Merchant found but user isn't, something's wrong",
            )

        account_repo.refresh(account_model)
        return StaffDetails(
            **staff_model.__dict__, account=Account(**account_model.__dict__)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=e)


@router.patch("/separate/{id}")
async def update_staff_separate(
    id: UUID,
    staff_updated: StaffUpdate,
    staff_repo: StaffRepoDep,
):
    _staff = staff_updated.model_dump()
    if _staff is None:
        raise HTTPException(status_code=404, detail="Merchant not found")

    return staff_repo.update(id, staff_updated)


@router.delete("/{id}")
async def delete_staff(
    id: UUID,
    staff_repo: StaffRepoDep,
    account_repo: AccountRepoDep,
):
    account = account_repo.get_by_id(id)
    staff = staff_repo.get_by_id(id)
    if account is None or staff is None:
        raise HTTPException(status_code=404, detail="Staff not found")

    staff_repo.delete(id)
    account_repo.delete(id)

    return StaffDetails(**staff.__dict__, account=Account(**account.__dict__))
