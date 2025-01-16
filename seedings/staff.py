import random
import random
from datetime import datetime, timedelta
from os import access

from connect import connection

cur = connection.cursor()


def get_accounts():
    cur.execute("SELECT * FROM parcelpoint.public.account")
    accounts = cur.fetchall()
    return accounts


def random_datetime_last_month():
    today = datetime.today()

    first_day_of_this_month = today.replace(day=1)
    last_day_of_last_month = first_day_of_this_month - timedelta(days=1)
    first_day_of_last_month = last_day_of_last_month.replace(day=1)
    random_date = first_day_of_last_month + timedelta(
        days=random.randint(0, (last_day_of_last_month - first_day_of_last_month).days)
    )

    random_hour = random.randint(0, 23)
    random_minute = random.randint(0, 59)
    random_second = random.randint(0, 59)
    random_datetime = random_date.replace(
        hour=random_hour, minute=random_minute, second=random_second
    )

    return random_datetime


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
        print("finished!")
    except Exception as e:
        print(e)
        connection.rollback()
