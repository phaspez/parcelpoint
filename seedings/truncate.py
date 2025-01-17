from seedings.connect import connection

cur = connection.cursor()


def truncate():
    try:
        cur.execute(
            """
            TRUNCATE TABLE account CASCADE;
            TRUNCATE TABLE address CASCADE;
            TRUNCATE TABLE merchant CASCADE;
            TRUNCATE TABLE "order" CASCADE;
            TRUNCATE TABLE package CASCADE;
            TRUNCATE TABLE packagerate CASCADE;
            TRUNCATE TABLE staff CASCADE;
            TRUNCATE TABLE storageblock CASCADE;
        """
        )
        connection.commit()
        print("finished!")
    except Exception as e:
        print(e)
        connection.rollback()
