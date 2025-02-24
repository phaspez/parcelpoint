import controllers.v1.dashboards.merchant as dashboard

from uuid import UUID
from fastapi import APIRouter, HTTPException
from dependencies import MerchantRepoDep, AccountRepoDep
from models.users.account import Account, AccountCreate, AccountUpdate
from models.users.merchant import (
    MerchantDetails,
    Merchant,
    MerchantCreate,
    MerchantCreateNoID,
    MerchantUpdate,
)

router = APIRouter(
    prefix="/merchant",
    tags=["merchant"],
)

router.include_router(dashboard.router)


@router.get("/")
async def get_merchants(merchant_repo: MerchantRepoDep):
    return merchant_repo.get_all()


@router.post("/register")
async def register_merchant(
    merchant_create: MerchantCreateNoID,
    account_create: AccountCreate,
    merchant_repo: MerchantRepoDep,
    account_repo: AccountRepoDep,
) -> MerchantDetails:
    account = account_repo.create(account_create)
    account_model = Account(**account.__dict__)
    merchant_model = MerchantCreate(
        **merchant_create.model_dump(),
        account_id=account.id,
    )
    merchant = merchant_repo.create(merchant_model)

    return MerchantDetails(account=account_model, **merchant_model.model_dump())


@router.get("/{id}")
async def get_merchant_by_id(
    id: UUID,
    merchant_repo: MerchantRepoDep,
    account_repo: AccountRepoDep,
    is_detailed: bool = False,
):
    merchant = merchant_repo.get_by_id(id)
    account = account_repo.get_by_id(id)

    merchant_model = Merchant(**merchant.__dict__)
    if is_detailed:
        account_model = Account(**account.__dict__)
        return MerchantDetails(account=account_model, **merchant_model.model_dump())
    return merchant_model


@router.patch("/{id}")
async def update_merchant(
    id: UUID,
    merchant_updated: MerchantUpdate,
    account_updated: AccountUpdate,
    merchant_repo: MerchantRepoDep,
    account_repo: AccountRepoDep,
):
    merchant = merchant_updated.model_dump()
    account = account_updated.model_dump()
    if merchant is None or account is None:
        raise HTTPException(status_code=404, detail="Merchant not found")

    account_model = account_repo.update(id, account_updated)
    merchant_model = merchant_repo.update(id, merchant_updated)

    account_repo.refresh(account_model)
    return MerchantDetails(
        **merchant_model.__dict__, account=Account(**account_model.__dict__)
    )


@router.delete("/{id}")
async def delete_merchant(
    id: UUID,
    merchant_repo: MerchantRepoDep,
    account_repo: AccountRepoDep,
):
    account = account_repo.get_by_id(id)
    merchant = merchant_repo.get_by_id(id)

    merchant_repo.delete(id)
    account_repo.delete(id)

    return MerchantDetails(**merchant.__dict__, account=Account(**account.__dict__))
