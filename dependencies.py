from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from connection import get_db
from repositories.order import OrderRepository
from repositories.package_rate import PackageRateRepository
from repositories.users.account import AccountRepository
from repositories.address import AddressRepository
from repositories.users.merchant import MerchantRepository
from repositories.package import PackageRepository
from repositories.users.staff import StaffRepository
from repositories.storage_block import StorageBlockRepository

DBSession = Annotated[Session, Depends(get_db)]


def get_account_repository(db: DBSession) -> AccountRepository:
    return AccountRepository(db)


AccountRepoDep = Annotated[AccountRepository, Depends(get_account_repository)]


def get_address_repository(db: DBSession) -> AddressRepository:
    return AddressRepository(db)


AddressRepoDep = Annotated[AddressRepository, Depends(get_address_repository)]


def get_merchant_repository(db: DBSession) -> MerchantRepository:
    return MerchantRepository(db)


MerchantRepoDep = Annotated[MerchantRepository, Depends(get_merchant_repository)]


def get_package_repository(db: DBSession) -> PackageRepository:
    return PackageRepository(db)


PackageRepoDep = Annotated[PackageRepository, Depends(get_package_repository)]


def get_staff_repository(db: DBSession) -> StaffRepository:
    return StaffRepository(db)


StaffRepoDep = Annotated[StaffRepository, Depends(get_staff_repository)]


def get_storage_block_repository(db: DBSession) -> StorageBlockRepository:
    return StorageBlockRepository(db)


StorageBlockRepoDep = Annotated[
    StorageBlockRepository, Depends(get_storage_block_repository)
]


def get_order_repository(db: DBSession) -> OrderRepository:
    return OrderRepository(db)


OrderRepoDep = Annotated[OrderRepository, Depends(get_order_repository)]


def get_package_rate_repository(db: DBSession) -> PackageRateRepository:
    return PackageRateRepository(db)


PackageRateRepoDep = Annotated[OrderRepository, Depends(get_package_rate_repository)]
