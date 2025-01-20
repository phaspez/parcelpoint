from typing import Annotated

from fastapi import Depends, HTTPException, Cookie
from fastapi.params import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from connection import get_db
from models.users.account import Account, AccountWithType
from repositories.order import OrderRepository
from repositories.package_rate import PackageRateRepository
from repositories.users.account import AccountRepository
from repositories.address import AddressRepository
from repositories.users.merchant import MerchantRepository
from repositories.package import PackageRepository
from repositories.users.staff import StaffRepository
from repositories.storage_block import StorageBlockRepository
from utils.jwt import verify_token, verify_token_dict

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


def require_logged_in_user(token: Annotated[str | None, Cookie()] = None):
    if not token:
        raise HTTPException(status_code=401, detail="Token is empty")
    try:
        user = verify_token(token)
        return user
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def require_logged_in_merchant(
    user: Account = Depends(require_logged_in_user), account_repo=AccountRepoDep
):
    type = account_repo.get_user_id_type(user)
    if type != "MERCHANT":
        raise HTTPException(
            status_code=401,
            detail="Unauthorized access, you must be a merchant to perform this action",
        )


def require_logged_in_staff(
    staff: Account = Depends(require_logged_in_user), account_repo=AccountRepoDep
):
    type = account_repo.get_user_id_type(staff)
    if type != "STAFF":
        raise HTTPException(
            status_code=401,
            detail="Unauthorized access, you must be a staff to perform this action",
        )


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/account/login")


async def get_current_user(
    account_repo: AccountRepoDep, token: Annotated[str, Depends(oauth2_scheme)]
) -> AccountWithType:
    user = verify_token_dict(token)
    user_id = user["user_id"]
    user = account_repo.get_by_id(user_id)
    user_type = account_repo.get_user_id_type(user_id)
    return AccountWithType(type=user_type, **user.__dict__)


LoggedInDep = Annotated[AccountWithType, Depends(get_current_user)]
