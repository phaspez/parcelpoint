import random
from concurrent.futures.thread import ThreadPoolExecutor
from datetime import timedelta
from uuid import uuid4

from seedings.connect import connection
from .utils import (
    cur,
    get_merchants,
    get_staffs,
    get_packages,
    random_datetime_last_month,
)

#
#
# def get_packages():
#     cur.execute(f"SELECT * FROM parcelpoint.public.package")
#     results = cur.fetchall()
#     return results


def insert_package_history(data):
    try:
        with connection.cursor() as local_cur:
            local_cur.execute(
                """
                        INSERT INTO parcelpoint.public.packagehistory VALUES 
                        (%s, %s, %s, %s, %s, %s)
                    """,
                data,
            )

        connection.commit()
        return True
    except Exception as e:
        print(f"Error inserting package history: {e}")
        connection.rollback()
        return False


def create_fake_data(packages, staffs):
    results = []
    for package in packages:
        date = random_datetime_last_month()
        for i in range(random.randint(1, 5)):
            package_id = package[0]
            staff_id = random.choice(staffs)[0]
            action = f"Test Action step {i}"
            notes = f"Test Note step {i}"
            timestamp = date - timedelta(days=5 - i)
            results.append((uuid4(), package_id, staff_id, action, notes, timestamp))
    return results


def seed_package_history():
    packages = get_packages()
    staffs = get_staffs()
    try:
        # for package in packages:
        #     insert_package_history(package)
        #
        # connection.commit()
        # print("finished seeding package history!")
        fake_data = create_fake_data(packages, staffs)

        with ThreadPoolExecutor(max_workers=4) as executor:
            results = list(executor.map(insert_package_history, fake_data))

        successful = sum(results)
        print(
            f"finished seeding package history! Successfully inserted {successful}/{len(results)} package histories"
        )
    except Exception as e:
        print(e)
        connection.rollback()
