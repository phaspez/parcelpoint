from typing import Annotated

from fastapi import APIRouter, HTTPException
from fastapi.params import Depends, Body, Cookie
from uuid import UUID

from models.users.account import (
    AccountCreate,
    AccountUpdate,
    AccountLogin,
    Account,
    AccountWithType,
    Token,
)
from utils.jwt import create_access_token, verify_token
from dependencies import AccountRepoDep, require_logged_in_user


router = APIRouter(
    prefix="/account",
    tags=["account"],
)


@router.get("/")
async def get_account(
    account_repo: AccountRepoDep, user=Depends(require_logged_in_user)
):
    accounts = account_repo.get_all()
    return accounts


@router.post("/")
async def create_account(account: AccountCreate, account_repo: AccountRepoDep):
    try:
        return account_repo.create(account)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{id}")
async def patch_account(
    id: UUID, account: AccountUpdate, account_repo: AccountRepoDep
) -> Account:
    try:
        updated = account_repo.update(id, account)
        return Account(**updated.__dict__)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
async def delete_account(id: UUID, account_repo: AccountRepoDep) -> Account:
    try:
        deleted = account_repo.delete(id)
        return Account(**deleted.__dict__)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login")
async def login_account(
    login: Annotated[AccountLogin, Body()], account_repo: AccountRepoDep
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
async def get_account_by_id(id: UUID, account_repo: AccountRepoDep) -> AccountWithType:
    account = account_repo.get_by_id(id)
    account_type = account_repo.get_user_id_type(id)

    at = AccountWithType(**account.__dict__, type=account_type)

    if not account or not account_type:
        raise HTTPException(status_code=404, detail="Account not found")
    return at
