from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from connection import get_db
from repositories.users.account import AccountRepository
from repositories.address import AddressRepository
from repositories.users.merchant import MerchantRepository
from repositories.package import PackageRepository
from repositories.users.staff import StaffRepository
from repositories.storage_block import StorageBlockRepository


def get_account_repository(db: Session = Depends(get_db)) -> AccountRepository:
    return AccountRepository(db)


AccountRepoDep = Annotated[AccountRepository, Depends(get_account_repository)]


def get_address_repository(db: Session = Depends(get_db)) -> AddressRepository:
    return AddressRepository(db)


AddressRepoDep = Annotated[AddressRepository, Depends(get_address_repository)]


def get_merchant_repository(db: Session = Depends(get_db)) -> MerchantRepository:
    return MerchantRepository(db)


MerchantRepoDep = Annotated[MerchantRepository, Depends(get_merchant_repository)]


def get_package_repository(db: Session = Depends(get_db)) -> PackageRepository:
    return PackageRepository(db)


PackageRepoDep = Annotated[PackageRepository, Depends(get_package_repository)]


def get_staff_repository(db: Session = Depends(get_db)) -> StaffRepository:
    return StaffRepository(db)


StaffRepoDep = Annotated[StaffRepository, Depends(get_staff_repository)]


def get_storage_block_repository(
    db: Session = Depends(get_db),
) -> StorageBlockRepository:
    return StorageBlockRepository(db)


StorageBlockDeps = Annotated[
    StorageBlockRepository, Depends(get_storage_block_repository)
]
