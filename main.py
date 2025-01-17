from fastapi import FastAPI
from routers import address, account, merchant, storage_block, staff, package

app = FastAPI()

app.include_router(address.router)
app.include_router(account.router)
app.include_router(merchant.router)
app.include_router(storage_block.router)
app.include_router(staff.router)
app.include_router(package.router)
