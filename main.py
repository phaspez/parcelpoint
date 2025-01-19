from typing import Annotated

from fastapi import FastAPI, Depends, HTTPException

from dependencies import AccountRepoDep
from models.users.account import Account
from routers.v1 import router

from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from utils.jwt import verify_token, create_access_token_dict, verify_token_dict
from repositories.users.account import hash_password, verify_password

origins = [
    "http://localhost:3000",
]

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,  # Allow cookies or authentication headers
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    user = verify_token_dict(token)
    return user


@app.get("/test")
async def read_items(
    account_repo: AccountRepoDep,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    id = current_user["user_id"]
    user = account_repo.get_by_id(id)
    return user


@app.post("/token")
async def test_login(
    account_repo: AccountRepoDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    user = account_repo.get_by_id(form_data.username)

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


app.include_router(router)
