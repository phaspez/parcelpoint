import random

import bcrypt

from seedings.connect import connection
from .utils import cur

# cur = connection.cursor()

test_users = 10


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def get_random_address_id():
    cur.execute("SELECT * FROM parcelpoint.public.address")
    addresses = cur.fetchall()
    rd = random.choice(addresses)
    return rd[0]


def seed_account():
    try:
        for user in range(test_users):
            name = f"username_{user+1}"
            phone = f"000000000{user+1}"
            email = f"username_{user+1}@example.com"
            hashed_password = hash_password(f"username_{user+1}")
            address_id = get_random_address_id()
            street = f"street name {user+1}"
            cur.execute(
                """
                INSERT INTO parcelpoint.public.account VALUES
                (gen_random_uuid(), %s, %s, %s, %s, %s, %s)
            """,
                (name, hashed_password, phone, email, address_id, street),
            )
        connection.commit()
        print("finished seeding accounts!")
    except Exception as e:
        print(e)
        connection.rollback()
