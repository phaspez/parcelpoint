from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

from schemas import *
from sqlalchemy.orm import sessionmaker

load_dotenv()

url = os.getenv("TEST_DATABASE_URL")
# test_uri = f"postgresql://{db_user}:{db_password}@localhost:5432/{db_test}"
engine = create_engine(url, echo=False)
Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
