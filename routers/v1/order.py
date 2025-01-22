from uuid import UUID

from fastapi import APIRouter, HTTPException

from dependencies import OrderRepoDep, LoggedInDep
from models.order import OrderCreate, OrderUpdate

router = APIRouter(
    prefix="/order",
    tags=["order"],
)


@router.get("/")
async def get_order(order_repo: OrderRepoDep):
    return order_repo.get_all()


@router.get("/my_orders")
async def get_orders_by_merchant(user: LoggedInDep, order_repo: OrderRepoDep):
    order = order_repo.get_by_merchant_id(user.id)
    return order


@router.post("/")
async def create_order(
    order: OrderCreate,
    order_repo: OrderRepoDep,
):
    try:
        res = order_repo.create(order)
        return res
    except ValueError as e:
        print(e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(e)
        return HTTPException(status_code=500, detail="Internal server error")


@router.get("/{id}")
async def get_orders_by_id(id: UUID, order_repo: OrderRepoDep):
    order = order_repo.get_by_id(id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order


@router.delete("/{id}")
async def delete_order(id: UUID, order_repo: OrderRepoDep):
    try:
        return order_repo.delete(id)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))


@router.patch("/{id}")
async def patch_order(
    id: UUID,
    updated: OrderUpdate,
    order_repo: OrderRepoDep,
):
    try:
        return order_repo.update(id, updated)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
