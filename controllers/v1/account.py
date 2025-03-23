import re
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, HTTPException, Body
from fastapi.params import Depends, Cookie
from fastapi.security import OAuth2PasswordRequestForm

from dependencies import (
    AccountRepoDep,
    require_logged_in_user,
    get_current_user,
    LoggedInDep,
)
from models.users.account import (
    AccountCreate,
    AccountUpdate,
    Account,
    AccountWithType,
)
from repositories.users.account import verify_password
from utils.jwt import (
    verify_token,
    create_access_token_dict,
)

router = APIRouter(
    prefix="/account",
    tags=["account"],
)


@router.get("/")
async def get_account(account_repo: AccountRepoDep):
    return account_repo.get_all()


@router.get("/me")
async def get_personal_info(
    current_user: LoggedInDep,
) -> AccountWithType:
    return current_user


def validate_login_identifier(username: str) -> tuple[str, str]:
    email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    phone_pattern = r"^[0-9]*$"

    if re.match(email_pattern, username):
        return "email", username.lower()
    elif re.match(phone_pattern, username):
        normalized_phone = "".join(filter(str.isdigit, username))
        return "phone", normalized_phone
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid login identifier. Please provide a valid email or phone number",
        )


@router.post("/login")
async def login_user(
    account_repo: AccountRepoDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    return account_repo.login(form_data)


@router.post("/")
async def create_account(account: AccountCreate, account_repo: AccountRepoDep):
    return account_repo.create(account)


@router.patch("/{id}")
async def patch_account(
    id: UUID,
    account: Annotated[AccountUpdate, Body()],
    account_repo: AccountRepoDep,
    user: LoggedInDep,
) -> Account:
    if user.id != id:
        raise HTTPException(
            status_code=400, detail="You are not authorized to modify this resource"
        )

    updated = account_repo.update(id, account)
    return Account(**updated.__dict__)


@router.delete("/{id}")
async def delete_account(
    id: UUID, account_repo: AccountRepoDep, user: LoggedInDep
) -> Account:
    if user.id != id:
        raise HTTPException(
            status_code=400, detail="You are not authorized to modify this resource"
        )

    deleted = account_repo.delete(id)
    return Account(**deleted.__dict__)


@router.get("/{id}")
async def get_account_by_id(id: UUID, account_repo: AccountRepoDep) -> AccountWithType:
    account = account_repo.get_by_id(id)
    account_type = account_repo.get_user_id_type(id)
    if not account or not account_type:
        raise HTTPException(status_code=404, detail="Account not found")

    at = AccountWithType(**account.__dict__, type=account_type)
    return at


@router.get("/detail/{id}")
async def get_accounts_detail(id: UUID, account_repo: AccountRepoDep):
    return account_repo.get_by_id_detail(id)
