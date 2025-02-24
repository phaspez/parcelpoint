from fastapi import APIRouter

from controllers.v1 import (
    account,
    address,
    merchant,
    order,
    package,
    package_rate,
    staff,
    storage_block,
)

router = APIRouter(
    prefix="/api/v1",
    tags=["v1"],
)


router.include_router(address.router)
router.include_router(account.router)
router.include_router(merchant.router)
router.include_router(storage_block.router)
router.include_router(staff.router)
router.include_router(package.router)
router.include_router(order.router)
router.include_router(package_rate.router)
