import random
from venv import create

import pandas as pd

from seedings.connect import connection
from seedings.utils import get_random_address_id, get_random_package_rate_id

columns = [
    "merchant_id",
    "block_id",
    "order_id",
    "name",
    "phone",
    "street",
    "description",
    "address_id",
    "is_urgent",
    "is_fragile",
    "status",
    "width",
    "length",
    "height",
    "weight",
    "package_rate_id",
    "shipping_cost",
    "cod_cost",
]


def create_data(_id: int):
    address = get_random_address_id()
    package_rate = get_random_package_rate_id()
    return {
        "description": random.choice(["Clothing", "Electronics", "Books"])
        + " "
        + str(_id),
        "address_id": address,
        "name": "Receiver name " + str(_id),
        "phone": "123456789" + str(_id),
        "street": "Street name " + str(_id),
        "width": round(random.uniform(5.0, 20.0), 1),
        "length": round(random.uniform(5.0, 20.0), 1),
        "height": round(random.uniform(5.0, 20.0), 1),
        "weight": round(random.uniform(5.0, 20.0), 1),
        "is_urgent": random.choice([True, False]),
        "is_fragile": random.choice([True, False]),
        "status": random.choice(
            ["ORDERED", "DELIVERING", "DELIVERED", "CANCELLED", "MISSING"]
        ),
        "package_rate_id": package_rate,
    }


def create_csv_bulk_data(count: int):
    data = []
    for i in range(count):
        new = create_data(i)
        data.append(new)

    df = pd.DataFrame(data, columns=columns)
    df.to_csv("sample_packages.csv", index=False)


if __name__ == "__main__":
    create_csv_bulk_data(10)
    print("CSV file created successfully.")
