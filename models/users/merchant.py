from datetime import datetime
from models.users.account import Account
from pydantic import BaseModel
from uuid import UUID


class Merchant(BaseModel):
    account_id: UUID
    company_name: str
    merchant_description: str
    registration_date: datetime


class MerchantDetails(Merchant):
    account: Account


class MerchantCreate(Merchant):
    pass


class MerchantCreateNoID(BaseModel):
    company_name: str
    merchant_description: str
    registration_date: datetime


class MerchantUpdate(BaseModel):
    company_name: str | None = None
    merchant_description: str | None = None
    registration_date: datetime | None = None
