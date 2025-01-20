import os

import psycopg
from dotenv import load_dotenv

load_dotenv()

db_name = os.getenv("DB_NAME")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")

connection = psycopg.connect(
    f"host=localhost port=5432 dbname={db_name} user={db_user} password={db_password} sslmode=prefer connect_timeout=10"
)
