from seedings.connect import connection

cur = connection.cursor()

max_block = 10
weights = [5, 100, 1000]
sizes = [10, 100, 1000]
packages = [1, 5, 1000]


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
        connection.commit()
        print("finished seeding storage blocks!")
    except Exception as e:
        print(e)
        connection.rollback()
