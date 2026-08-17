from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.notification import Notification


def list_notifications(db: Session, limit: int = 50, unread_only: bool = False) -> List[Notification]:
    query = db.query(Notification)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).limit(limit).all()


def get_unread_count(db: Session) -> int:
    return db.query(Notification).filter(Notification.is_read == False).count()


def mark_read(db: Session, notification_id: int) -> bool:
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n:
        return False
    n.is_read = True
    db.commit()
    return True


def mark_all_read(db: Session) -> int:
    count = (
        db.query(Notification)
        .filter(Notification.is_read == False)
        .update({"is_read": True})
    )
    db.commit()
    return count
