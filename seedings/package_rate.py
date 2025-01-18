import random
from uuid import uuid4

from seedings.connect import connection
from .utils import cur

base_rates = [10000, 15000, 30000]
base_weight = [2, 5, 10]
oversize_rate = [10000, 7000, 5000]
overweight_rate_per_kg = [5000, 4000, 3000]
fragile_rate = [30000, 30000, 20000]
urgent_rate = [40000, 35000, 30000]


def seed_package_rate():
    try:
        for idx in range(3):
            cur.execute(
                """
                INSERT INTO parcelpoint.public.packagerate VALUES
                (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
                (
                    uuid4(),
                    f"Package rate {idx}",
                    base_rates[idx],
                    base_weight[idx],
                    oversize_rate[idx],
                    overweight_rate_per_kg[idx],
                    fragile_rate[idx],
                    urgent_rate[idx],
                ),
            )
        connection.commit()
        print("finished seeding package rate!")
    except Exception as e:
        print(e)
        connection.rollback()
