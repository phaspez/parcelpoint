from truncate import truncate
from account import seed_account
from address import seed_address
from merchant import seed_merchant


def global_setup():
    truncate()
    seed_address()
    seed_account()
    seed_merchant()


def global_teardown():
    truncate()
