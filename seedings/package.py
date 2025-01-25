from concurrent.futures.thread import ThreadPoolExecutor
from uuid import uuid4

from seedings.connect import connection
from .utils import (
    get_random_address_id,
    get_random_merchant_id,
    get_random_order_id,
    get_random_package_rate_id,
    random_float,
    random_bool,
    random_package_status,
)


def get_storage_block_within_limits(cur, vol=1, weight=1, num_package=1):
    cur.execute(
        """
            WITH BlockCapacity AS (
                SELECT
                    sb.id,
                    COUNT(p2.id) as current_count,
                    COALESCE(SUM(p2.weight), 0) as current_weight,
                    COALESCE(SUM(p2.width * p2.length * p2.weight), 0) as current_volume
                FROM parcelpoint.public.storageblock sb
                LEFT JOIN parcelpoint.public.package p2 on sb.id = p2.block_id
                GROUP BY (sb.id)
                ORDER BY current_count , current_weight , current_volume 
            )

            SELECT sb.id, bc.current_count, sb.max_package FROM parcelpoint.public.storageblock sb
            LEFT JOIN BlockCapacity bc ON sb.id = bc.id
            WHERE %s + bc.current_count <= sb.max_package 
            AND %s + bc.current_weight <= sb.max_weight
            AND %s + bc.current_volume <= sb.max_size
            ORDER BY current_count DESC, current_weight DESC, current_volume DESC
            """,
        (num_package, weight, vol),
    )

    results = cur.fetchone()
    print(f"Diagnostic Info - Packages: {num_package}, Weight: {weight}, Volume: {vol}")
    if results:
        print(f"MAX: {results[1]}/{results[2]}")
        print(f"Query Results: {results}", end="\n\n")
    return results[0] if results else None


def create_package_data(package_id: int, cursor) -> tuple:
    w, l, h = random_float(10, 50, 2), random_float(10, 50, 2), random_float(10, 50, 2)
    weight = random_float(1, 3, 2)
    storage_blocks = get_storage_block_within_limits(
        cursor,
        vol=w * l * h,
        weight=weight,
        num_package=1,
    )
    storage_blocks = storage_blocks if storage_blocks else None
    # print(block_id)
    return (
        uuid4(),
        get_random_merchant_id(),
        storage_blocks,
        get_random_order_id(),
        get_random_address_id(),
        f"Description Package {package_id}",
        f"Street to deliver package {package_id}",
        f"Receiver of package {package_id}",
        f"000000000{package_id}",
        w,
        l,
        h,
        weight,
        random_bool(),
        random_bool(),
        random_package_status(),
        get_random_package_rate_id(),
        random_float(1000, 40000, 0),
        random_float(1000, 1000000, 0),
    )


def insert_package(package_data: tuple, cursor) -> bool:
    try:
        cursor.execute(
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
        # connection.rollback()
        return False


def seed_package(num_packages=20):
    try:
        cur = connection.cursor()
        for i in range(num_packages):
            package = create_package_data(i, cur)
            insert_package(package, cur)
            connection.commit()
            # print_storage(package[2])
        print("finished seeding packages")

        # with ThreadPoolExecutor(max_workers=4) as executor:
        #     results = list(executor.map(insert_package, package_data_list))
        #
        # successful = sum(results)
        # print(
        #     f"finished seeding packages! Successfully inserted {successful}/{num_packages} packages"
        # )
        connection.commit()
    except Exception as e:
        print(e)
        connection.rollback()
