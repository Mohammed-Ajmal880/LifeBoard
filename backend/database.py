import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    print("Testing database connection...")
    if not SQLALCHEMY_DATABASE_URL:
        print("\n❌ ERROR: DATABASE_URL not found in environment variables.")
        print("Please ensure your .env file exists in the root directory and contains DATABASE_URL.")
    else:
        try:
            # Force a connection attempt to PostgreSQL
            with engine.connect() as connection:
                print("\n==================================================")
                print("🎉 SUCCESS: database.py is working and connected to PostgreSQL!")
                print("==================================================")
        except Exception as e:
            print("\n❌ ERROR: Could not connect to PostgreSQL database.")
            print(f"Details: {e}")
            print("\nDouble check your pgAdmin4 credentials, database name, and that PostgreSQL is running.")