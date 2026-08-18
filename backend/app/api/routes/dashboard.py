from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_store_id
from app.schemas.dashboard import DashboardData
from app.services import dashboard_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardData)
def get_dashboard(
    period: str = Query("30d", description="Period: today, 7d, 30d, this_month, last_month"),
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    return dashboard_service.get_full_dashboard(db, period, store_id)
