from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.notification import NotificationResponse, NotificationCount
from app.services import notification_service

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationResponse])
def list_notifications(
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return notification_service.list_notifications(db, limit, unread_only)


@router.get("/unread-count", response_model=NotificationCount)
def unread_count(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return NotificationCount(unread=notification_service.get_unread_count(db))


@router.put("/{notification_id}/read", status_code=200)
def mark_read(notification_id: int, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    notification_service.mark_read(db, notification_id)
    return {"ok": True}


@router.put("/read-all", status_code=200)
def mark_all_read(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    count = notification_service.mark_all_read(db)
    return {"marked": count}
