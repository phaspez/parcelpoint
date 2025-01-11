from sqlalchemy import create_engine
from dotenv import load_dotenv
import os
from schemas import Base
from sqlalchemy.orm import sessionmaker

load_dotenv()

db_name = os.getenv("DB_NAME")
db_user = os.getenv("POSTGRESQL_USER")
db_password = os.getenv("POSTGRESQL_PASSWORD")
db_env = os.getenv("ENV")
db_test = "parcelpoint-test"

uri = f"postgresql://{db_user}:{db_password}@localhost:5432/{db_name}"
# test_uri = f"postgresql://{db_user}:{db_password}@localhost:5432/{db_test}"
engine = create_engine(uri, echo=False)
Base.metadata.create_all(engine)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
