from seedings.connect import connection
from .utils import cur, get_accounts, random_datetime_last_month


def seed_merchant():
    try:
        for idx, user in enumerate(get_accounts()):
            if idx % 2 == 0:
                continue

            id = user[0]
            company_name = user[1] + "_company"
            merchant_desc = user[1] + "_desc"
            registered = random_datetime_last_month()
            cur.execute(
                """
                INSERT INTO parcelpoint.public.merchant VALUES
                (%s, %s, %s, %s)
            """,
                (id, company_name, merchant_desc, registered),
            )
        connection.commit()
        print("finished seeding merchants!")
    except Exception as e:
        print(e)
        connection.rollback()
