from typing import Annotated

from fastapi import APIRouter, HTTPException
from fastapi.params import Depends, Body, Cookie
from sqlalchemy.orm import Session
from uuid import UUID

from sqlalchemy.testing.pickleable import User

from connection import get_db
from models.account import (
    AccountCreate,
    AccountUpdate,
    AccountLogin,
    Account,
    AccountWithType,
    Token,
)
from repositories.account import AccountRepository
from utils.jwt import create_access_token, verify_token


def get_account_repository(db: Session = Depends(get_db)) -> AccountRepository:
    return AccountRepository(db)


def require_logged_in_user(token: Annotated[str | None, Cookie()] = None):
    if not token:
        raise HTTPException(status_code=401, detail="Token is empty")
    try:
        user = verify_token(token)
        return user
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


router = APIRouter(
    prefix="/account",
    tags=["account"],
)


@router.get("/")
async def get_account(
    account_repo: AccountRepository = Depends(get_account_repository),
    user=Depends(require_logged_in_user),
):
    accounts = account_repo.get_all()
    return accounts


@router.post("/")
async def create_account(
    account: Annotated[AccountCreate, Body()],
    account_repo: AccountRepository = Depends(get_account_repository),
):
    try:
        return account_repo.create(account)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{id}")
async def patch_account(
    id: UUID,
    account: Annotated[AccountUpdate, Body()],
    account_repo: AccountRepository = Depends(get_account_repository),
) -> Account:
    try:
        updated = account_repo.update(id, account)
        return Account(**updated.__dict__)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
async def delete_account(
    id: UUID, account_repo: AccountRepository = Depends(get_account_repository)
) -> Account:
    try:
        deleted = account_repo.delete(id)
        return Account(**deleted.__dict__)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login")
async def login_account(
    login: Annotated[AccountLogin, Body()],
    account_repo: AccountRepository = Depends(get_account_repository),
) -> Token:
    try:
        account_instance = account_repo.check_user_password(
            login.password, login.phone, login.email
        )
        account = Account(**account_instance.__dict__)
        account_type = account_repo.get_user_id_type(account.id)
        account_with_type = AccountWithType(**account.model_dump(), type=account_type)
        account_token = create_access_token(account_with_type)
        return Token(token=account_token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test_jwt")
async def test_post_jwt(token: Annotated[str | None, Cookie()] = None) -> Account:
    if not token:
        raise HTTPException(status_code=400, detail="Token is empty")
    user = verify_token(token)
    return user


@router.get("/{id}")
async def get_account_by_id(
    id: UUID,
    account_repo: AccountRepository = Depends(get_account_repository),
) -> AccountWithType:
    account = account_repo.get_by_id(id)
    account_type = account_repo.get_user_id_type(id)

    at = AccountWithType(**account.__dict__, type=account_type)

    if not account or not account_type:
        raise HTTPException(status_code=404, detail="Account not found")
    return at
