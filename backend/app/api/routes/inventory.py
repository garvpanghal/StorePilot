from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.inventory import InventoryAdjustment, InventoryTransactionResponse, InventoryOverview, LowStockProduct
from app.services import inventory_service

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("/overview", response_model=InventoryOverview)
def get_overview(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return inventory_service.get_inventory_overview(db)


@router.get("/low-stock", response_model=List[LowStockProduct])
def get_low_stock(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    products = inventory_service.get_low_stock_products(db)
    return [
        LowStockProduct(
            id=p.id, name=p.name, sku=p.sku,
            current_stock=p.current_stock, reorder_level=p.reorder_level,
            stock_status=p.stock_status,
            category_name=p.category.name if p.category else None,
        )
        for p in products
    ]


@router.get("/history", response_model=List[InventoryTransactionResponse])
def get_history(
    product_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    txns = inventory_service.get_transaction_history(db, product_id, limit)
    return [
        InventoryTransactionResponse(
            id=t.id, product_id=t.product_id,
            product_name=t.product.name if t.product else None,
            transaction_type=t.transaction_type, quantity=t.quantity,
            reference_type=t.reference_type, reference_id=t.reference_id,
            notes=t.notes, created_at=t.created_at,
        )
        for t in txns
    ]


@router.post("/adjust", response_model=InventoryTransactionResponse, status_code=201)
def adjust_stock(data: InventoryAdjustment, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    try:
        txn = inventory_service.adjust_stock(db, data.product_id, data.quantity, data.notes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return InventoryTransactionResponse(
        id=txn.id, product_id=txn.product_id,
        product_name=txn.product.name if txn.product else None,
        transaction_type=txn.transaction_type, quantity=txn.quantity,
        reference_type=txn.reference_type, reference_id=txn.reference_id,
        notes=txn.notes, created_at=txn.created_at,
    )
