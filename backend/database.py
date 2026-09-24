"""
SQLite database setup using SQLAlchemy.
Creates all tables on startup. Uses SQLite file at backend/meeting_ai.db.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(__file__), "meeting_ai.db"))
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Called on app startup."""
    from backend import models  # noqa: F401 — ensures models are registered
    Base.metadata.create_all(bind=engine)
