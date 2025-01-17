from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


from schemas import package_rate, package, address, storage_block, order, users
