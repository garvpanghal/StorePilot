from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse, SupplierDetail
from app.services import supplier_service

router = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])


@router.get("", response_model=List[SupplierResponse])
def list_suppliers(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return supplier_service.list_suppliers(db)


@router.get("/{supplier_id}", response_model=SupplierDetail)
def get_supplier(supplier_id: int, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    supplier = supplier_service.get_supplier(db, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return SupplierDetail(
        **{c.name: getattr(supplier, c.name) for c in supplier.__table__.columns},
        product_count=len(supplier.products),
        purchase_count=len(supplier.purchases),
    )


@router.post("", response_model=SupplierResponse, status_code=201)
def create_supplier(data: SupplierCreate, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return supplier_service.create_supplier(db, data)


@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(supplier_id: int, data: SupplierUpdate, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    result = supplier_service.update_supplier(db, supplier_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return result


@router.delete("/{supplier_id}", status_code=204)
def delete_supplier(supplier_id: int, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    if not supplier_service.delete_supplier(db, supplier_id):
        raise HTTPException(status_code=404, detail="Supplier not found")
