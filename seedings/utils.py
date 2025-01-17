from datetime import datetime, timedelta
import random

from seedings.connect import connection

cur = connection.cursor()


def _feed_table(table_name):
    cur.execute(f"SELECT * FROM parcelpoint.public.{table_name}")
    results = cur.fetchall()
    return results


def get_accounts():
    return _feed_table("account")


def get_merchants():
    return _feed_table("merchant")


def get_staffs():
    return _feed_table("staff")


def get_orders():
    return _feed_table("order")


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
