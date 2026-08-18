from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.deps import get_current_store_id
from app.schemas.notification import NotificationResponse, NotificationCount
from app.services import notification_service

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationResponse])
def list_notifications(
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    return notification_service.list_notifications(db, limit, unread_only, store_id)


@router.get("/unread-count", response_model=NotificationCount)
def unread_count(db: Session = Depends(get_db), store_id: int = Depends(get_current_store_id)):
    return NotificationCount(unread=notification_service.get_unread_count(db, store_id))


@router.put("/{notification_id}/read", status_code=200)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    notification_service.mark_read(db, notification_id, store_id)
    return {"ok": True}


@router.put("/read-all", status_code=200)
def mark_all_read(db: Session = Depends(get_db), store_id: int = Depends(get_current_store_id)):
    count = notification_service.mark_all_read(db, store_id)
    return {"marked": count}


@router.delete("/{notification_id}", status_code=200)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    success = notification_service.delete_notification(db, notification_id, store_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"ok": True}


@router.delete("", status_code=200)
def delete_all_notifications(
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    count = notification_service.delete_all_notifications(db, store_id)
    return {"deleted": count}

