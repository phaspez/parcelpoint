from typing import Annotated

from fastapi import APIRouter, HTTPException
from fastapi.params import Depends, Body
from sqlalchemy.orm import Session
from uuid import UUID
from connection import get_db
from models.account import AccountCreate, AccountUpdate, AccountLogin, Account
from repositories.account import AccountRepository
from schemas.account import AccountSchema
from utils.jwt import create_access_token

router = APIRouter(
    prefix="/account",
    tags=["account"],
)


def get_account_repository(db: Session = Depends(get_db)) -> AccountRepository:
    return AccountRepository(db)


@router.get("/")
async def get_account(
    account_repo: AccountRepository = Depends(get_account_repository),
):
    accounts = account_repo.get_all()
    return accounts


@router.get("/{id}")
async def get_account_by_id(
    id: UUID,
    account_repo: AccountRepository = Depends(get_account_repository),
):
    account = account_repo.get_by_id(id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.post("/")
async def create_account(
    account: Annotated[AccountCreate, Body()],
    account_repo: AccountRepository = Depends(get_account_repository),
):
    try:
        return account_repo.create(account)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{id}")
async def patch_account(
    id: UUID,
    account: Annotated[AccountUpdate, Body()],
    account_repo: AccountRepository = Depends(get_account_repository),
):
    try:
        return account_repo.update(id, account)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
async def delete_account(
    id: UUID, account_repo: AccountRepository = Depends(get_account_repository)
):
    try:
        return account_repo.delete(id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login")
async def login_account(
    login: Annotated[AccountLogin, Body()],
    account_repo: AccountRepository = Depends(get_account_repository),
):
    try:
        account_instance = account_repo.check_user_password(
            login.password, login.phone, login.email
        )
        account = Account(**account_instance.__dict__)
        account_token = create_access_token(account)
        return account_token
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
