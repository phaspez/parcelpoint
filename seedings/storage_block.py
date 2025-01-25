from seedings.connect import connection

cur = connection.cursor()

max_block = 10
weights = [10, 50, 100]
sizes = [10e2, 10e3, 10e4]
packages = [1, 1, 1]


def seed_storage_block():
    try:
        count = 1
        for weight in weights:
            for size in sizes:
                for package in packages:
                    cur.execute(
                        """
                        INSERT INTO parcelpoint.public.storageblock VALUES
                        (gen_random_uuid(), %s, %s, %s, %s)
                    """,
                        (f"storage_block_{count}", weight, size, package),
                    )
                    count += 1
        connection.commit()
        print("finished seeding storage blocks!")
    except Exception as e:
        print(e)
        connection.rollback()
