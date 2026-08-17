import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import engine
from sqlalchemy import text

client = TestClient(app)

def test_health_endpoint():
    """
    Test that GET /health is active and returns status 'ok'.
    This endpoint must work even if the database is unavailable.
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_health_db_endpoint():
    """
    Test that GET /health/db checks database status.
    Depending on if PostgreSQL is running or not, it should return:
    - 200 OK with database: connected
    - 503 Service Unavailable with database connection error details
    """
    response = client.get("/health/db")
    assert response.status_code in (200, 503)
    
    if response.status_code == 200:
        data = response.json()
        assert data.get("status") == "ok"
        assert data.get("database") == "connected"
    else:
        # Service Unavailable
        data = response.json()
        assert "detail" in data
        assert "Database connection is unavailable" in data["detail"]

def test_database_connectivity_direct():
    """
    Directly tests database connectivity.
    If database connectivity fails, we skip this test cleanly
    to avoid blocking developer workflow when local PostgreSQL is not running.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        pytest.skip(f"Skipping direct DB test because PostgreSQL is unavailable: {e}")
