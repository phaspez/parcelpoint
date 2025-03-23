from typing import Type
from uuid import uuid4, UUID

import bcrypt
from fastapi import HTTPException, status
from psycopg.errors import UniqueViolation
from sqlalchemy import and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from starlette.status import HTTP_400_BAD_REQUEST

from models.address import Address
from models.users.account import AccountCreate, AccountUpdate, Account
from repositories.base import BaseRepository
from schemas.address import AddressSchema
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

    def get_all(self):
        merchant_accounts = (
            self.db.query(AccountSchema, MerchantSchema, AddressSchema)
            .join(MerchantSchema, AccountSchema.id == MerchantSchema.account_id)
            .outerjoin(AddressSchema, AccountSchema.address_id == AddressSchema.id)
            .all()
        )

        staff_accounts = (
            self.db.query(AccountSchema, StaffSchema, AddressSchema)
            .join(StaffSchema, AccountSchema.id == StaffSchema.account_id)
            .outerjoin(AddressSchema, AccountSchema.address_id == AddressSchema.id)
            .all()
        )

        merchant_results = []

        for account, merchant, address in merchant_accounts:
            result = account.__dict__.copy()
            result.pop("_sa_instance_state", None)
            result["merchant"] = {
                k: v for k, v in merchant.__dict__.items() if not k.startswith("_")
            }
            result["address"] = {
                k: v for k, v in address.__dict__.items() if not k.startswith("_")
            }
            merchant_results.append(result)

        staff_results = []
        for account, staff, address in staff_accounts:
            result = account.__dict__.copy()
            result.pop("_sa_instance_state", None)
            result["staff"] = {
                k: v for k, v in staff.__dict__.items() if not k.startswith("_")
            }
            result["address"] = {
                k: v for k, v in address.__dict__.items() if not k.startswith("_")
            }
            staff_results.append(result)

        return {"merchants": merchant_results, "staff": staff_results}

    def get_by_id_detail(self, account_id: UUID):
        result = (
            self.db.query(AccountSchema, MerchantSchema, StaffSchema, AddressSchema)
            .filter(AccountSchema.id == account_id)
            .outerjoin(MerchantSchema, AccountSchema.id == MerchantSchema.account_id)
            .outerjoin(StaffSchema, AccountSchema.id == StaffSchema.account_id)
            .outerjoin(AddressSchema, AccountSchema.address_id == AddressSchema.id)
            .first()
        )

        if not result:
            return None

        account, merchant, staff, address = result
        print(result)

        account_data = account.__dict__.copy()
        account_data.pop("_sa_instance_state", None)
        account_data.pop("hashed_password", None)
        account_data.pop("address_id", None)

        if merchant:
            merchant_data = merchant.__dict__.copy()
            merchant_data.pop("_sa_instance_state", None)
            account_data["merchant"] = merchant_data

        if staff:
            staff_data = staff.__dict__.copy()
            staff_data.pop("_sa_instance_state", None)
            staff_data.pop("account_id", None)
            account_data["staff"] = staff_data

        if address:
            address_data = address.__dict__.copy()
            address_data.pop("_sa_instance_state", None)
            address_data.pop("id", None)
            account_data["address"] = address_data

        return account_data

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

    def get_by_google_id(self, google_id: str) -> AccountSchema:
        user: AccountSchema | None = (
            self.db.query(AccountSchema)
            .filter(AccountSchema.google_id == google_id)
            .first()
        )
        if user is None:
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST,
                detail=f"User with Google ID {google_id} does not exist",
            )
        return user

    def get_by_email(self, email: str) -> AccountSchema:
        user: AccountSchema | None = (
            self.db.query(AccountSchema).filter(AccountSchema.email == email).first()
        )

        if user is None:
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST,
                detail=f"User with email {email} does not exist",
            )
        return user

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
