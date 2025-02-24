from typing import Type
from uuid import uuid4, UUID

import bcrypt
from fastapi import HTTPException, status
from psycopg.errors import UniqueViolation
from sqlalchemy import and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from starlette.status import HTTP_400_BAD_REQUEST

from models.users.account import AccountCreate, AccountUpdate, Account
from repositories.base import BaseRepository
from schemas.users import StaffSchema
from schemas.users.account import AccountSchema
from schemas.users.merchant import MerchantSchema
import re

from utils.jwt import create_access_token_dict


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


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed_password.encode())


class AccountRepository(BaseRepository[AccountSchema, AccountCreate, AccountUpdate]):
    def __init__(self, db: Session):
        super().__init__(db, AccountSchema)

    def create(self, schema: AccountCreate) -> AccountSchema:
        try:
            account = schema.model_dump()
            account["hashed_password"] = hash_password(schema.password)
            account["id"] = uuid4()
            account.pop("password")

            model = AccountSchema(**account)
            self.db.add(model)
            self.db.commit()
            self.db.refresh(model)
            return model
        except IntegrityError as e:
            self.db.rollback()
            if isinstance(e.orig, UniqueViolation):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Phone or Email already exists",
                )
            raise HTTPException(status_code=400, detail=e.detail)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=e)

    def update(self, id: UUID, updated_values: AccountUpdate) -> AccountSchema | None:
        try:
            if updated_values.password is not None:
                updated_values.hashed_password = hash_password(updated_values.password)
            return super().update(id, updated_values)
        except IntegrityError as e:
            self.db.rollback()
            if isinstance(e.orig, UniqueViolation):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Phone or Email already exists",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=e.detail,
            )
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=e)

    def refresh(self, instance):
        self.db.refresh(instance)

    def check_user_password(
        self, password: str, phone: str | None, email: str | None = None
    ) -> Type[AccountSchema]:
        check = email if phone is None else phone
        by = "email" if phone is None else "phone"
        if check is None:
            raise ValueError("Enter phone or email")

        user: Type[AccountSchema] | None = (
            self.db.query(AccountSchema)
            .filter(and_(getattr(AccountSchema, by) == check))
            .first()
        )
        if user is None:
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST,
                detail=f"User with {by} {check} does not exist",
            )

        if not verify_password(password, str(user.hashed_password)):
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST,
                detail="Phone or Password is incorrect",
            )

        return user

    def get_user_id_type(self, id: UUID):
        user = self.get_by_id(id)
        if not user:
            raise ValueError(f"User with {id} does not exist")

        is_in_merchant = (
            self.db.query(MerchantSchema)
            .filter(and_(MerchantSchema.account_id == user.id))
            .first()
        )

        if is_in_merchant:
            return "MERCHANT"

        is_in_staff = (
            self.db.query(StaffSchema)
            .filter(and_(StaffSchema.account_id == user.id))
            .first()
        )

        if is_in_staff:
            return "STAFF"

        return ""

    def login(self, form_data):
        # arbitrary number for testing invalid fields
        if len(form_data.password) < 6 or len(form_data.username) < 3:
            raise HTTPException(status_code=400, detail="Invalid field input")

        identifier_type, normalized_username = validate_login_identifier(
            form_data.username
        )

        user = self.check_user_password(
            password=form_data.password,
            email=normalized_username if identifier_type == "email" else None,
            phone=normalized_username if identifier_type == "phone" else None,
        )

        account = Account(**user.__dict__)
        verified = verify_password(form_data.password, account.hashed_password)
        if not verified:
            raise HTTPException(
                status_code=400, detail="Incorrect username or password"
            )

        access_token = create_access_token_dict({"user_id": str(account.id)})
        return {
            "access_token": access_token,
            "token_type": "bearer",
        }
