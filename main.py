from fastapi import FastAPI
from routers import (
    address,
    account,
    merchant,
    storage_block,
    staff,
    package,
    order,
    package_rate,
)

app = FastAPI()

app.include_router(address.router)
app.include_router(account.router)
app.include_router(merchant.router)
app.include_router(storage_block.router)
app.include_router(staff.router)
app.include_router(package.router)
app.include_router(order.router)
app.include_router(package_rate.router)
