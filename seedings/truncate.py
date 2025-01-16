from connect import connection

cur = connection.cursor()


def truncate():
    try:
        cur.execute(
            """
            TRUNCATE TABLE account, address, merchant, order, package, packagerate, staff, storageblock CASCADE;
        """
        )
        connection.commit()
        print("finished!")
    except Exception as e:
        print(e)
        connection.rollback()
