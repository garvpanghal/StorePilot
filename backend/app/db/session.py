from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from app.core.config import settings

# Create engine with pool_pre_ping enabled to detect disconnected connections
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"connect_timeout": 3}
)

# Create session maker
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db() -> Generator[Session, None, None]:
    """
    Dependency generator for FastAPI route handlers.
    Ensures that database sessions are closed after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
