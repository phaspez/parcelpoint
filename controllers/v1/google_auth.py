from fastapi import FastAPI, Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2AuthorizationCodeBearer
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
from pydantic import BaseModel
from typing import Optional
import os
from dependencies import AccountRepoDep
from models.users.account import AccountUpdate
from schemas.users import AccountSchema
from utils.jwt import create_access_token, create_access_token_dict

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

router = APIRouter(
    prefix="/auth/google",
    tags=["auth.google"],
)


class GoogleToken(BaseModel):
    token: str


class Account(BaseModel):
    name: str
    email: str
    hashed_password: Optional[str] = None
    phone: Optional[str] = None
    google_id: Optional[str] = None

    class Config:
        orm_mode = True


async def verify_google_token(token: str) -> dict:
    try:
        id_info = id_token.verify_oauth2_token(
            token, requests.Request(), GOOGLE_CLIENT_ID
        )

        if id_info["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError("Invalid issuer")

        return id_info
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")


# Routes
@router.post("/")
async def google_auth(token: GoogleToken, account_repo: AccountRepoDep):
    # Verify the Google token
    user_info = await verify_google_token(token.token)
    print(user_info)

    user: AccountSchema | None = None
    print(user_info["sub"])
    print(user_info["email"])
    try:
        user = account_repo.get_by_google_id(user_info["sub"])
    except:
        user = None

    if not user:
        # check if email exists but without Google auth
        try:
            user = account_repo.get_by_email(user_info["email"])
        except:
            user = None
        print(user)
        if user:
            # link Google ID to existing account
            account_update = AccountUpdate(google_id=user_info["sub"])
            account_repo.update(user.id, account_update)
        else:
            raise HTTPException(
                status_code=401,
                detail="Account not exist",
            )

    # Generate JWT token or your preferred session mechanism
    # user_model: Account = Account(**user.__dict__)
    access_token = create_access_token_dict({"user_id": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }
