from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

from sqlalchemy.orm import sessionmaker

load_dotenv()

db_name = os.getenv("DB_NAME")
db_user = os.getenv("POSTGRESQL_USER")
db_password = os.getenv("POSTGRESQL_PASSWORD")
db_env = os.getenv("ENV")

# connection_str = f"host=localhost port=5432 dbname={db_name} user={db_user} password={db_password} sslmode=prefer connect_timeout=10"
uri = f"postgresql://{db_user}:{db_password}@localhost:5432/{db_name}"


# def get_database_engine():
#     if db_env == "dev":
#         return create_engine(test_uri, echo=True)
#     if db_env == "prod":
#         return create_engine(uri, echo=False)
#     else:
#         ValueError("Environment not supported, use dev or prod")


engine = create_engine(uri, echo=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
