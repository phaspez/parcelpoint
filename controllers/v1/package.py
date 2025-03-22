from datetime import datetime
from uuid import UUID
from io import BytesIO
import pandas as pd
from fastapi import APIRouter, HTTPException, Query, Body
from fastapi.responses import StreamingResponse
from dependencies import (
    PackageRepoDep,
    LoggedInDep,
    OrderRepoDep,
    MerchantRepoDep,
    PackageHistoryRepoDep,
)
from models.order import OrderCreate
from models.package import PackageCreate, PackageUpdate, Package, PackageCreateNoOrder
import controllers.v1.package_history as package_history

router = APIRouter(
    prefix="/package",
    tags=["package"],
)

router.include_router(package_history.router)


@router.get("/")
async def get_packages(
    package_repo: PackageRepoDep,
):
    return package_repo.get_all()


@router.post("/")
async def create_package(package_create: PackageCreate, package_repo: PackageRepoDep):
    try:
        return package_repo.create(package_create)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/my_packages")
async def create_single_merchant_packages(
    package_create: PackageCreateNoOrder,
    user: LoggedInDep,
    package_repo: PackageRepoDep,
    order_repo: OrderRepoDep,
    merchant_repo: MerchantRepoDep,
):
    try:
        merchant = merchant_repo.get_by_id(user.id)

        if not merchant:
            raise HTTPException(status_code=400, detail="You must be a merchant")

        order_create = OrderCreate(
            merchant_id=merchant.account_id,
            date=datetime.now(),
            details=f"Order auto-created at {datetime.now()}",
        )
        order = order_repo.create(order_create)

        package_create.merchant_id = user.id
        package_create.order_id = order.id
        package = PackageCreate(**package_create.model_dump())
        return package_repo.create(package)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/my_packages")
async def get_merchant_packages(
    package_repo: "PackageRepoDep",
    user: "LoggedInDep",
    merchant_id: UUID | None = None,
    block_id: UUID | None = None,
    order_id: UUID | None = None,
    is_urgent: bool | None = None,
    is_fragile: bool | None = None,
    min_weight: float | None = None,
    max_weight: float | None = None,
    status: str | None = None,
    days_ago: int = Query(365, gt=0),
    offset: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
):
    results = package_repo.query_packages_paginated(
        merchant_id=user.id,
        block_id=block_id,
        order_id=order_id,
        is_urgent=is_urgent,
        is_fragile=is_fragile,
        min_weight=min_weight,
        max_weight=max_weight,
        days_ago=days_ago,
        status=status,
        page=offset,
        page_size=limit,
    )
    return results


@router.get("/my_packages/export")
async def export_merchant_packages(
    package_repo: PackageRepoDep,
    user: LoggedInDep,
    merchant_id: UUID | None = None,
    block_id: UUID | None = None,
    order_id: UUID | None = None,
    is_urgent: bool | None = None,
    is_fragile: bool | None = None,
    min_weight: float | None = None,
    max_weight: float | None = None,
    status: str | None = None,
    days_ago: int = Query(365, gt=0),
    limit: int = Query(999999, ge=0),
    offset: int = Query(0, ge=0),
):
    try:
        current_date = datetime.now().strftime("%Y-%m-%d %H%M:%S")
        results = package_repo.query_packages(
            merchant_id=user.id,
            block_id=block_id,
            order_id=order_id,
            is_urgent=is_urgent,
            is_fragile=is_fragile,
            min_weight=min_weight,
            max_weight=max_weight,
            days_ago=days_ago,
            limit=limit,
            status=status,
            offset=offset,
        )

        df = pd.DataFrame([package for package in results])
        df = df.drop(
            [
                "_sa_instance_state",
                "merchant_id",
                "merchant_name",
                "package_rate_id",
                "block_id",
            ],
            axis=1,
        )

        column_order = [
            col
            for col in df.columns
            if col
            not in ["width", "length", "height", "weight", "shipping_cost", "cod_cost"]
        ] + ["width", "length", "height", "weight", "shipping_cost", "cod_cost"]

        df = df[column_order]
        row_count = len(df)

        sum_cod = df["cod_cost"].sum()
        sum_shipping = df["shipping_cost"].sum()

        output = BytesIO()
        with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
            df.to_excel(writer, index=False, sheet_name="Packages", startrow=5)

            workbook = writer.book
            sheet = writer.sheets["Packages"]

            title_format = workbook.add_format(
                {"font_name": "JetBrains Mono", "font_size": 18, "bold": True}
            )
            subtitle_format = workbook.add_format(
                {"font_name": "JetBrains Mono", "font_size": 11}
            )
            header_format = workbook.add_format(
                {
                    "font_name": "JetBrains Mono",
                    "font_size": 11,
                    "bold": True,
                    "align": "center",
                    "bg_color": "#B3D8A8",
                    "border": 1,
                }
            )
            currency_format = workbook.add_format({"num_format": '#,##0"₫"'})
            light_fill_format = workbook.add_format({"bg_color": "#FBFFE4"})

            # Header
            sheet.write("A1", "ParcelPoint", title_format)
            sheet.write("A2", "Package Report", subtitle_format)
            sheet.write("A3", f"Report exported on {current_date}", subtitle_format)
            sheet.write("A4", f"Days Queried: {days_ago}", subtitle_format)
            sheet.write("E2", f"Total Revenue: {sum_cod}", subtitle_format)
            sheet.write("E3", f"Total Shipping fee: {sum_shipping}", subtitle_format)
            sheet.write("E4", f"Total Packages: {row_count}", subtitle_format)

            # format rows and widths
            for col_num, column_title in enumerate(df.columns, 0):
                sheet.write(5, col_num, column_title, header_format)

            for col_num, column_title in enumerate(df.columns):
                max_length = max(
                    df[column_title].astype(str).map(len).max(), len(column_title)
                )
                sheet.set_column(col_num, col_num, max_length + 2)

            # zebra striping the table
            for row in range(6, 6 + row_count, 2):
                sheet.set_row(row, None, light_fill_format)

            if "shipping_cost" in df.columns:
                shipping_cost_col_idx = df.columns.get_loc("shipping_cost")
                for row in range(6, 6 + row_count):
                    sheet.write(
                        row,
                        shipping_cost_col_idx,
                        df.iloc[row - 6, shipping_cost_col_idx],
                        currency_format,
                    )

            if "cod_cost" in df.columns:
                cod_cost_col_idx = df.columns.get_loc("cod_cost")
                for row in range(6, 6 + row_count):
                    sheet.write(
                        row,
                        cod_cost_col_idx,
                        df.iloc[row - 6, cod_cost_col_idx],
                        currency_format,
                    )

        output.seek(0)

        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=parcelpoint_packages_{current_date}.xlsx"
            },
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/search")
async def search_packages(
    package_repo: PackageRepoDep,
    merchant_id: UUID | None = None,
    block_id: UUID | None = None,
    order_id: UUID | None = None,
    is_urgent: bool | None = None,
    is_fragile: bool | None = None,
    status: str | None = None,
    min_weight: float | None = None,
    max_weight: float | None = None,
    days_ago: int | None = None,
    limit: int = Query(20, le=50),
    offset: int = Query(1, gt=0),  # page
):
    results = package_repo.query_packages_paginated(
        merchant_id=merchant_id,
        block_id=block_id,
        order_id=order_id,
        is_urgent=is_urgent,
        is_fragile=is_fragile,
        min_weight=min_weight,
        max_weight=max_weight,
        days_ago=days_ago,
        status=status,
        page=offset,
        page_size=limit,
    )
    return results


@router.patch("/{id}")
async def patch_package(
    id: UUID, package_patched: PackageUpdate, package_repo: PackageRepoDep
) -> Package:
    try:
        updated = package_repo.update(id, package_patched)
        return Package(**updated.__dict__)
    except ValueError as e:
        print(e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
async def delete_block(
    id: UUID, package_repo: PackageRepoDep, package_history_repo: PackageHistoryRepoDep
) -> Package:
    try:
        package_history_repo.delete_all_by_package_id(id)
        deleted = package_repo.delete(id)
        return Package(**deleted.__dict__)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}")
async def get_package(id: UUID, package_repo: PackageRepoDep) -> Package:
    package = package_repo.get_by_id(id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    return Package(**package.__dict__)
