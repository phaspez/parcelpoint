"""update

Revision ID: 13afd73ec301
Revises: 
Create Date: 2025-01-23 10:55:20.758834

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "13afd73ec301"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "address",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("province", sa.String(), nullable=True),
        sa.Column("district", sa.String(), nullable=True),
        sa.Column("commune", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        if_not_exists=True,
    )
    op.create_table(
        "packagerate",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("base_rate", sa.Float(), nullable=True),
        sa.Column("base_weight", sa.Float(), nullable=True),
        sa.Column("oversize_rate", sa.Float(), nullable=True),
        sa.Column("overweight_rate_per_kg", sa.Float(), nullable=True),
        sa.Column("fragile_rate", sa.Float(), nullable=True),
        sa.Column("urgent_rate", sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        if_not_exists=True,
    )
    op.create_table(
        "storageblock",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("max_weight", sa.Float(), nullable=True),
        sa.Column("max_size", sa.Float(), nullable=True),
        sa.Column("max_package", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        if_not_exists=True,
    )
    op.create_table(
        "account",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("hashed_password", sa.String(), nullable=True),
        sa.Column("phone", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("address_id", sa.UUID(), nullable=False),
        sa.Column("street", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["address_id"],
            ["address.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("phone"),
        if_not_exists=True,
    )
    op.create_table(
        "merchant",
        sa.Column("account_id", sa.UUID(), nullable=False),
        sa.Column("company_name", sa.String(), nullable=True),
        sa.Column("merchant_description", sa.String(), nullable=True),
        sa.Column("registration_date", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["account_id"],
            ["account.id"],
        ),
        sa.PrimaryKeyConstraint("account_id"),
        if_not_exists=True,
    )
    op.create_table(
        "staff",
        sa.Column("account_id", sa.UUID(), nullable=False),
        sa.Column("position", sa.String(), nullable=True),
        sa.Column("department", sa.String(), nullable=False),
        sa.Column("hire_date", sa.Date(), nullable=False),
        sa.Column("access_level", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["account_id"],
            ["account.id"],
        ),
        sa.PrimaryKeyConstraint("account_id"),
        if_not_exists=True,
    )
    op.create_table(
        "order",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("merchant_id", sa.UUID(), nullable=False),
        sa.Column("staff_id", sa.UUID(), nullable=True),
        sa.Column("date", sa.DateTime(), nullable=False),
        sa.Column("details", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ["merchant_id"],
            ["merchant.account_id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        if_not_exists=True,
    )
    op.create_table(
        "package",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("merchant_id", sa.UUID(), nullable=False),
        sa.Column("block_id", sa.UUID(), nullable=True),
        sa.Column("order_id", sa.UUID(), nullable=True),
        sa.Column("address_id", sa.UUID(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("street", sa.String(), nullable=True),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("width", sa.Float(), nullable=True),
        sa.Column("height", sa.Float(), nullable=True),
        sa.Column("length", sa.Float(), nullable=True),
        sa.Column("weight", sa.Float(), nullable=True),
        sa.Column("is_fragile", sa.Boolean(), nullable=True),
        sa.Column("is_urgent", sa.Boolean(), nullable=True),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("package_rate_id", sa.UUID(), nullable=False),
        sa.Column("shipping_cost", sa.Float(), nullable=True),
        sa.Column("cod_cost", sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(
            ["address_id"],
            ["address.id"],
        ),
        sa.ForeignKeyConstraint(
            ["block_id"],
            ["storageblock.id"],
        ),
        sa.ForeignKeyConstraint(
            ["merchant_id"],
            ["merchant.account_id"],
        ),
        sa.ForeignKeyConstraint(
            ["order_id"],
            ["order.id"],
        ),
        sa.ForeignKeyConstraint(
            ["package_rate_id"],
            ["packagerate.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        if_not_exists=True,
    )
    op.create_table(
        "packagehistory",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("package_id", sa.UUID(), nullable=False),
        sa.Column("staff_id", sa.UUID(), nullable=True),
        sa.Column("action", sa.String(), nullable=True),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("timestamp", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["package_id"],
            ["package.id"],
        ),
        sa.ForeignKeyConstraint(
            ["staff_id"],
            ["staff.account_id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        if_not_exists=True,
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("packagehistory")
    op.drop_table("package")
    op.drop_table("order")
    op.drop_table("staff")
    op.drop_table("merchant")
    op.drop_table("account")
    op.drop_table("storageblock")
    op.drop_table("packagerate")
    op.drop_table("address")
    # ### end Alembic commands ###
