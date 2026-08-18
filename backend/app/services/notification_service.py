from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.notification import Notification


def list_notifications(db: Session, limit: int = 50, unread_only: bool = False, store_id: Optional[int] = None) -> List[Notification]:
    query = db.query(Notification).filter(Notification.store_id == store_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).limit(limit).all()


def get_unread_count(db: Session, store_id: int) -> int:
    return db.query(Notification).filter(Notification.is_read == False, Notification.store_id == store_id).count()


def mark_read(db: Session, notification_id: int, store_id: int) -> bool:
    n = db.query(Notification).filter(Notification.id == notification_id, Notification.store_id == store_id).first()
    if not n:
        return False
    n.is_read = True
    db.commit()
    return True


def mark_all_read(db: Session, store_id: int) -> int:
    count = (
        db.query(Notification)
        .filter(Notification.is_read == False, Notification.store_id == store_id)
        .update({"is_read": True})
    )
    db.commit()
    return count


def delete_notification(db: Session, notification_id: int, store_id: int) -> bool:
    n = db.query(Notification).filter(Notification.id == notification_id, Notification.store_id == store_id).first()
    if not n:
        return False
    db.delete(n)
    db.commit()
    return True


def delete_all_notifications(db: Session, store_id: int) -> int:
    count = db.query(Notification).filter(Notification.store_id == store_id).delete()
    db.commit()
    return count

