import random
from datetime import datetime, timedelta
from uuid import uuid4

from seedings.connect import connection
from .utils import cur, get_merchants, get_staffs, random_datetime_last_month

orders = 5


def seed_order():
    merchants = get_merchants()
    staffs = get_staffs()
    try:
        for i in range(orders):
            merchant_id = random.choice(merchants)[0]
            staff_id = random.choice(staffs)[0]
            date = random_datetime_last_month()
            details = f"Detail for order {i}"
            cur.execute(
                """
                INSERT INTO parcelpoint.public.order VALUES
                (%s, %s, %s, %s, %s)
            """,
                (uuid4(), merchant_id, staff_id, date, details),
            )
        connection.commit()
        print("finished seeding orders!")
    except Exception as e:
        print(e)
        connection.rollback()
