from typing import Annotated

from pydantic import BaseModel, EmailStr, AfterValidator
from uuid import UUID


def check_phone_length(phone_number: str) -> str:
    if len(phone_number) < 10:
        raise ValueError("Phone number must be at least 10 digits")
    return phone_number


class Account(BaseModel):
    id: UUID
    name: str
    hashed_password: str
    phone: Annotated[str, AfterValidator(check_phone_length)]
    email: EmailStr | None = None
    address_id: UUID
    street: str


class AccountWithType(Account):
    type: str


class Token(BaseModel):
    token: str


class AccountCreate(BaseModel):
    name: str
    password: str
    phone: Annotated[str, AfterValidator(check_phone_length)]
    email: EmailStr
    address_id: UUID
    street: str


class AccountLogin(BaseModel):
    email: EmailStr | None = None
    password: str
    phone: Annotated[str, AfterValidator(check_phone_length)] | None = None


class AccountUpdate(BaseModel):
    name: str | None = None
    password: str | None = None
    hashed_password: str | None = None
    phone: Annotated[str, AfterValidator(check_phone_length)] | None = None
    email: EmailStr | None = None
    address_id: UUID | None = None
    street: str | None = None
