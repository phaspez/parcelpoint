from datetime import datetime, timedelta

import jwt
import os

from models.account import Account

jwt_secret = os.getenv("JWT_SECRET")
expire_in_minutes = 60 * 24 * 7


def create_access_token(user: Account) -> str:
    print("creating token account")
    to_encode = user.model_dump()
    to_encode["id"] = str(to_encode["id"])
    to_encode["address_id"] = str(to_encode["address_id"])
    expire = datetime.now() + timedelta(minutes=expire_in_minutes)
    to_encode.update({"exp": expire})

    result = jwt.encode(to_encode, jwt_secret, algorithm="HS256")
    return result


def verify_token(token: str) -> Account:
    """Verifies the JWT token."""
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        return Account(**payload)
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.PyJWTError:
        raise ValueError("Invalid token")
