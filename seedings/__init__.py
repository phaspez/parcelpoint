from .staff import seed_staff
from .storage_block import seed_storage_block
from .truncate import truncate
from .account import seed_account
from .address import seed_address
from .merchant import seed_merchant


def global_setup():
    truncate()
    seed_address()
    seed_storage_block()
    seed_account()
    seed_merchant()
    seed_staff()


def global_teardown():
    truncate()
