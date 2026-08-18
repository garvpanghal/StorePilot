from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate, SupplierUpdate


def list_suppliers(db: Session, store_id: int) -> List[Supplier]:
    return db.query(Supplier).filter(Supplier.store_id == store_id).order_by(Supplier.name).all()


def get_supplier(db: Session, supplier_id: int, store_id: int) -> Optional[Supplier]:
    return db.query(Supplier).filter(Supplier.id == supplier_id, Supplier.store_id == store_id).first()


def create_supplier(db: Session, data: SupplierCreate, store_id: int) -> Supplier:
    supplier = Supplier(**data.model_dump(), store_id=store_id)
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier


def update_supplier(db: Session, supplier_id: int, data: SupplierUpdate, store_id: int) -> Optional[Supplier]:
    supplier = get_supplier(db, supplier_id, store_id)
    if not supplier:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(supplier, key, value)
    db.commit()
    db.refresh(supplier)
    return supplier


def delete_supplier(db: Session, supplier_id: int, store_id: int) -> bool:
    supplier = get_supplier(db, supplier_id, store_id)
    if not supplier:
        return False
    db.delete(supplier)
    db.commit()
    return True
