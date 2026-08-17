from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.dashboard import DashboardData
from app.services import dashboard_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardData)
def get_dashboard(
    period: str = Query("30d", description="Period: today, 7d, 30d, this_month, last_month"),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return dashboard_service.get_full_dashboard(db, period)
