import random

from connect import connection

cur = connection.cursor()

test_name = "test_username"
test_users = 10

def get_random_address_id():
    cur.execute("SELECT * FROM parcelpoint.public.address")
    addresses = cur.fetchall()
    rd = random.choice(addresses)
    return rd[0]

try:
    for user in range(test_users):
        name = f"test_username_{user+1}"
        phone = f"000000000{user+1}"
        email = f"test_username_{user+1}@example.com"
        hashed_password = f"password_{user+1}"
        address_id = get_random_address_id()
        street = f"street name {user+1}"
        cur.execute("""
            INSERT INTO parcelpoint.public.account VALUES
            (gen_random_uuid(), %s, %s, %s, %s, %s, %s)
        """, (name, hashed_password, phone, email, address_id, street))
    connection.commit()
    print('finished!')
except Exception as e:
    print(e)
    connection.rollback()