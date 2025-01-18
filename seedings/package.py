import random
from uuid import uuid4

import bcrypt
from Lib.concurrent.futures.thread import ThreadPoolExecutor
from seedings.connect import connection
from .utils import (
    cur,
    get_random_address_id,
    get_random_merchant_id,
    get_random_order_id,
    get_random_package_rate_id,
    random_float,
    random_bool,
    random_package_status,
)


def create_package_data(package_id: int) -> tuple:
    return (
        uuid4(),
        get_random_merchant_id(),
        None,
        get_random_order_id(),
        get_random_address_id(),
        f"Description Package {package_id}",
        f"Street to deliver package {package_id}",
        f"Receiver of package {package_id}",
        f"000000000{package_id}",
        random_float(1, 2, 2),
        random_float(1, 2, 2),
        random_float(1, 2, 2),
        random_float(1, 3, 2),
        random_bool(),
        random_bool(),
        random_package_status(),
        get_random_package_rate_id(),
        random_float(1000, 100000, 1),
        0,
    )


def insert_package(package_data: tuple) -> bool:
    try:
        with connection.cursor() as local_cur:
            local_cur.execute(
                """
                INSERT INTO parcelpoint.public.package VALUES
                (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                package_data,
            )
            connection.commit()
            return True
    except Exception as e:
        print(f"Error inserting package: {e}")
        connection.rollback()
        return False


def seed_package(num_packages=20):
    try:
        package_data_list = [create_package_data(i) for i in range(num_packages)]
        with ThreadPoolExecutor(max_workers=4) as executor:
            results = list(executor.map(insert_package, package_data_list))

        successful = sum(results)
        print(
            f"finished seeding packages! Successfully inserted {successful}/{num_packages} packages"
        )
    except Exception as e:
        print(e)
        connection.rollback()
