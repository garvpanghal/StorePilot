from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.core.logging import logger

router = APIRouter()

@router.get("/health", status_code=status.HTTP_200_OK)
def check_health():
    """
    Basic health check endpoint.
    Verifies that the API service is running.
    This endpoint is independent of database health.
    """
    return {"status": "ok"}

@router.get("/health/db", status_code=status.HTTP_200_OK)
def check_db_health(db: Session = Depends(get_db)):
    """
    Database health check endpoint.
    Verifies that the API service can query the PostgreSQL database.
    """
    try:
        # Execute a lightweight query to test connectivity
        db.execute(text("SELECT 1"))
        return {
            "status": "ok",
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable"
        )
