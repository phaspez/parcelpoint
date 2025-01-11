from typing import Type
from uuid import uuid4, UUID

import bcrypt
from psycopg.errors import UniqueViolation
from sqlalchemy import and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.account import AccountCreate, AccountUpdate
from repositories.base import BaseRepository
from schemas.account import AccountSchema
from schemas.merchant import MerchantSchema


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

            result = super().update(id, updated_values)
            self.db.commit()
            self.db.refresh(result)
            return result
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

        is_in_merchant = self.db.query(MerchantSchema).filter(
            and_(MerchantSchema.account_id == user.id)
        )
        if is_in_merchant:
            return "MERCHANT"

        return ValueError("Internal Server Error")
