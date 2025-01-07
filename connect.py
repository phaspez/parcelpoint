import psycopg
from dotenv import load_dotenv
import os

load_dotenv()

db_name = os.getenv("DB_NAME")
db_user = os.getenv("POSTGRESQL_USER")
db_password = os.getenv("POSTGRESQL_PASSWORD")

connection = psycopg.connect(f"host=localhost port=5432 dbname={db_name} user={db_user} password={db_password} sslmode=prefer connect_timeout=10")

# with psycopg.connect("host=localhost port=5432 dbname=parcelpoint user=postgres password=postgres sslmode=prefer connect_timeout=10") as conn:
#     with conn.cursor() as cur:
#         # cur.execute("""
#         #     CREATE TABLE test_two (
#         #         id serial PRIMARY KEY,
#         #         num integer,
#         #         data text)
#         #     """)
#         #
#         # print('test two created')
#         # cur.execute("INSERT INTO test(num, data) VALUES (%s, %s)", (100, "abc'def"))
#         cur.execute("SELECT * FROM test")
#         record = cur.fetchone()
#
#         print(record)
