from fastapi import FastAPI, Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2AuthorizationCodeBearer
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
from pydantic import BaseModel
from typing import Optional
import os

from connection import get_db
from dependencies import AccountRepoDep
from models.users.account import AccountUpdate
from schemas.users import AccountSchema
from utils.jwt import create_access_token

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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token"
        )


# Routes
@router.post("/auth/google")
async def google_auth(token: GoogleToken, account_repo: AccountRepoDep):
    # Verify the Google token
    user_info = await verify_google_token(token.token)

    user = account_repo.get_by_google_id(user_info["sub"])

    if not user:
        # check if email exists but without Google auth
        user = account_repo.get_by_email(user_info["email"])

        if user:
            # link Google ID to existing account
            account_update = AccountUpdate(google_id=user_info["sub"])
            account_update.goo
            account_repo.update(user.id, AccountUpdate())
            user.google_id = user_info["sub"]
            db.commit()
        else:
            # Create new account
            user = AccountSchema(
                name=user_info["name"],
                email=user_info["email"],
                google_id=user_info["sub"],
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    # Generate JWT token or your preferred session mechanism
    access_token = create_access_token(data={"sub": user.email})

    return {"access_token": access_token, "token_type": "bearer"}
