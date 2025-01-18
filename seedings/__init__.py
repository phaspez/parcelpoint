from seedings.account import seed_account
from seedings.address import seed_address
from seedings.merchant import seed_merchant
from seedings.order import seed_order
from seedings.package import seed_package
from seedings.package_rate import seed_package_rate
from seedings.staff import seed_staff
from seedings.storage_block import seed_storage_block
from seedings.truncate import truncate
from seedings.utils import get_storage_block_within_limits


def global_setup():
    truncate()
    seed_address()
    seed_package_rate()
    seed_storage_block()
    seed_account(num_users=20)
    seed_merchant()
    seed_staff()
    seed_order(num_order=7)
    seed_package(num_packages=20)


def global_teardown():
    truncate()


if __name__ == "__main__":
    global_setup()
