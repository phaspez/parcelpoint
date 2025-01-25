from typing import Type
from uuid import uuid4, UUID

import bcrypt
from psycopg.errors import UniqueViolation
from sqlalchemy import and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.users.account import AccountCreate, AccountUpdate
from repositories.base import BaseRepository
from schemas.users import StaffSchema
from schemas.users.account import AccountSchema
from schemas.users.merchant import MerchantSchema


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
                raise ValueError("Phone or Email already exists")
            raise ValueError(e.orig)

    def update(self, id: UUID, updated_values: AccountUpdate) -> AccountSchema | None:
        try:
            if updated_values.password is not None:
                updated_values.hashed_password = hash_password(updated_values.password)
            return super().update(id, updated_values)
        except IntegrityError as e:
            self.db.rollback()
            if isinstance(e.orig, UniqueViolation):
                raise ValueError("Phone or Email already exists")
            raise e
        except Exception as e:
            self.db.rollback()
            raise e

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
            raise ValueError(f"User with {by} {check} does not exist")

        if not verify_password(password, str(user.hashed_password)):
            raise ValueError("Phone or Password is incorrect")

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
