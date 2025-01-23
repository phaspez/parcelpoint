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
    accounts = account_repo.get_all()
    return accounts


@router.get("/me")
async def get_personal_info(
    current_user: LoggedInDep,
):
    try:
        return current_user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid access token")


def validate_login_identifier(username: str) -> tuple[str, str]:
    email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    phone_pattern = r"^[0-9]*$"

    if re.match(email_pattern, username):
        return ("email", username.lower())
    elif re.match(phone_pattern, username):
        normalized_phone = "".join(filter(str.isdigit, username))
        return ("phone", normalized_phone)
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
    # arbitrary number for testing invalid fields
    if len(form_data.password) < 6 or len(form_data.username) < 5:
        raise HTTPException(status_code=400, detail="Invalid field input")

    identifier_type, normalized_username = validate_login_identifier(form_data.username)

    user = account_repo.check_user_password(
        password=form_data.password,
        email=normalized_username if identifier_type == "email" else None,
        phone=normalized_username if identifier_type == "phone" else None,
    )

    if not user:
        raise HTTPException(status_code=400, detail="Invalid user")

    account = Account(**user.__dict__)
    verified = verify_password(form_data.password, account.hashed_password)
    if not verified:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token = create_access_token_dict({"user_id": str(account.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


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
    id: UUID,
    account: Annotated[AccountUpdate, Body()],
    account_repo: AccountRepoDep,
    user: LoggedInDep,
) -> Account:
    try:
        if user.id != id:
            raise HTTPException(
                status_code=400, detail="You are not authorized to modify this resource"
            )

        updated = account_repo.update(id, account)
        return Account(**updated.__dict__)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
async def delete_account(
    id: UUID, account_repo: AccountRepoDep, user: LoggedInDep
) -> Account:
    try:
        if user.id != id:
            raise HTTPException(
                status_code=400, detail="You are not authorized to modify this resource"
            )

        deleted = account_repo.delete(id)
        return Account(**deleted.__dict__)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# @router.post("/login")
# async def login_account(
#     login: Annotated[AccountLogin, Body()], account_repo: AccountRepoDep
# ) -> Token:
#     try:
#         account_instance = account_repo.check_user_password(
#             login.password, login.phone, login.email
#         )
#         account = Account(**account_instance.__dict__)
#         account_type = account_repo.get_user_id_type(account.id)
#         account_with_type = AccountWithType(**account.model_dump(), type=account_type)
#         account_token = create_access_token(account_with_type)
#         return Token(token=account_token)
#     except ValueError as e:
#         raise HTTPException(status_code=400, detail=str(e))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}")
async def get_account_by_id(id: UUID, account_repo: AccountRepoDep) -> AccountWithType:
    account = account_repo.get_by_id(id)
    account_type = account_repo.get_user_id_type(id)

    at = AccountWithType(**account.__dict__, type=account_type)

    if not account or not account_type:
        raise HTTPException(status_code=404, detail="Account not found")
    return at
