import random
import bcrypt
from concurrent.futures.thread import ThreadPoolExecutor
from seedings.connect import connection
from .utils import cur, get_random_address_id


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def create_user_data(user_id: int) -> tuple:
    name = f"username_{user_id + 1}"
    phone = f"000000000{user_id + 1}"
    email = f"username_{user_id + 1}@example.com"
    hashed_password = hash_password(f"username_{user_id + 1}")
    address_id = get_random_address_id()
    street = f"street name {user_id + 1}"

    return name, hashed_password, phone, email, address_id, street


def insert_user(user_data: tuple) -> bool:
    try:
        with connection.cursor() as local_cur:
            local_cur.execute(
                """
                INSERT INTO parcelpoint.public.account VALUES
                (gen_random_uuid(), %s, %s, %s, %s, %s, %s)
                """,
                user_data,
            )
            connection.commit()
            return True
    except Exception as e:
        print(f"Error inserting user: {e}")
        connection.rollback()
        return False


def seed_account(num_users=10):
    try:
        user_data_list = [create_user_data(i) for i in range(num_users)]
        with ThreadPoolExecutor(max_workers=4) as executor:
            results = list(executor.map(insert_user, user_data_list))

        successful = sum(results)
        print(
            f"Finished seeding accounts! Successfully inserted {successful}/{num_users} accounts"
        )
    except Exception as e:
        print(e)
        connection.rollback()
