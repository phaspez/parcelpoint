import random

from seedings.connect import connection
from .utils import cur, get_accounts, random_datetime_last_month

access_levels = [0, 1, 2]
positions = ["Pickup", "Delivery", "Manager"]


def seed_staff():
    try:
        for idx, user in enumerate(get_accounts()):
            if idx % 2 != 0:
                continue

            id = user[0]
            access_level = random.choice(access_levels)
            position = positions[access_level]
            department = random.choice(["Dept. A", "Dept. B"])
            hire_date = random_datetime_last_month()

            cur.execute(
                """
                INSERT INTO parcelpoint.public.staff VALUES
                (%s, %s, %s, %s, %s)
            """,
                (id, position, department, hire_date, access_level),
            )
        connection.commit()
        print("finished seeding staffs!")
    except Exception as e:
        print(e)
        connection.rollback()
