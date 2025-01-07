from connect import connection

def get_test():
    cur = connection.cursor()
    try:
        cur.execute('SELECT * FROM test')
        result = cur.fetchall()
        return result
    except Exception as e:
        cur.rollback()
        print(e)
        return None
