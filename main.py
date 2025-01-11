from typing import Annotated

from fastapi import FastAPI, Body
from routers import address, account, merchant

app = FastAPI()

app.include_router(address.router)
app.include_router(account.router)
app.include_router(merchant.router)
