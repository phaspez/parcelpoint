import random
from datetime import datetime, timedelta

from seedings.connect import connection

cur = connection.cursor()


def _feed_table(table_name):
    cur.execute(f"SELECT * FROM parcelpoint.public.{table_name}")
    results = cur.fetchall()
    return results


def get_accounts():
    return _feed_table("account")


def get_packages():
    return _feed_table("package")


def get_merchants():
    return _feed_table("merchant")


def get_staffs():
    cur.execute(
        f"SELECT * FROM parcelpoint.public.staff WHERE staff.account_id NOT IN (SELECT account_id FROM parcelpoint.public.merchant)"
    )
    results = cur.fetchall()
    return results


def get_orders():
    return _feed_table("order")


def get_random_address_id():
    return random.choice(_feed_table("address"))[0]


def get_random_merchant_id():
    return random.choice(_feed_table("merchant"))[0]


def get_random_staff_id():
    return random.choice(_feed_table("staff"))[0]


def get_random_order_id():
    return random.choice(_feed_table("order"))[0]


def get_random_package_rate_id():
    return random.choice(_feed_table("packagerate"))[0]


def get_storage_block_within_limits(vol=1, weight=1, num_package=1):
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
    return results[0] if results else None


def get_storage_block_under_capacity(volume: float, weight: float, num_package: int):
    cur.execute(
        """
        SELECT sb.*
        FROM parcelpoint.public.storageblock sb
        LEFT JOIN parcelpoint.public.package p ON sb.id = p.block_id
        WHERE (sb.max_package < %s) AND (sb.max_weight < %s) AND (sb.max_size < %s)
        GROUP BY sb.id, sb.max_package, sb.max_weight, sb.max_size
    """,
        (num_package, weight, volume),
    )
    return cur.fetchall()


def random_float(a, b, n):
    return round(random.uniform(a, b), n)


def random_bool():
    return random.choice([True, False])


def random_package_status():
    status = ["ORDERED", "DELIVERING", "DELIVERED", "DELIVERED", "CANCELLED", "MISSING"]
    return random.choice(status)


def random_datetime_last_month():
    today = datetime.today()

    start_date = today - timedelta(days=30)
    random_date = start_date + timedelta(days=random.randint(0, 30))

    # first_day_of_this_month = today.replace(day=1)
    # last_day_of_last_month = first_day_of_this_month - timedelta(days=1)
    # first_day_of_last_month = last_day_of_last_month.replace(day=1)
    # random_date = first_day_of_last_month + timedelta(
    #     days=random.randint(0, (last_day_of_last_month - first_day_of_last_month).days)
    # )

    random_hour = random.randint(0, 23)
    random_minute = random.randint(0, 59)
    random_second = random.randint(0, 59)
    random_datetime = random_date.replace(
        hour=random_hour, minute=random_minute, second=random_second
    )

    return random_datetime
