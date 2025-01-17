from seedings.storage_block import seed_storage_block
from seedings.truncate import truncate
from seedings.account import seed_account
from seedings.address import seed_address
from seedings.merchant import seed_merchant
from seedings.staff import seed_staff


def global_setup():
    truncate()
    seed_address()
    seed_storage_block()
    seed_account()
    seed_merchant()
    seed_staff()


def global_teardown():
    truncate()


if __name__ == "__main__":
    global_setup()
