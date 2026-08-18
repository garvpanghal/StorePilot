from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_store_id
from app.schemas.purchase import PurchaseCreate, PurchaseResponse, PurchaseListResponse, PurchaseItemResponse
from app.services import purchase_service

router = APIRouter(prefix="/api/purchases", tags=["Purchases"])


@router.get("", response_model=PurchaseListResponse)
def list_purchases(
    page: int = 1,
    page_size: int = 50,
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    result = purchase_service.list_purchases(db, store_id, page, page_size)
    items = []
    for p in result["items"]:
        items.append(PurchaseResponse(
            id=p.id,
            supplier_id=p.supplier_id,
            supplier_name=p.supplier.name if p.supplier else None,
            total=float(p.total),
            status=p.status,
            notes=p.notes,
            created_at=p.created_at,
            items=[
                PurchaseItemResponse(
                    id=pi.id,
                    product_id=pi.product_id,
                    product_name=pi.product.name if pi.product else None,
                    quantity=pi.quantity,
                    unit_cost=float(pi.unit_cost),
                    subtotal=float(pi.subtotal),
                )
                for pi in p.items
            ],
            item_count=len(p.items),
        ))
    return PurchaseListResponse(
        items=items,
        total=result["total"],
        page=result["page"],
        page_size=result["page_size"],
        pages=result["pages"],
    )


@router.get("/{purchase_id}", response_model=PurchaseResponse)
def get_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    purchase = purchase_service.get_purchase(db, purchase_id, store_id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return PurchaseResponse(
        id=purchase.id,
        supplier_id=purchase.supplier_id,
        supplier_name=purchase.supplier.name if purchase.supplier else None,
        total=float(purchase.total),
        status=purchase.status,
        notes=purchase.notes,
        created_at=purchase.created_at,
        item_count=len(purchase.items),
        items=[
            PurchaseItemResponse(
                id=pi.id,
                product_id=pi.product_id,
                product_name=pi.product.name if pi.product else None,
                quantity=pi.quantity,
                unit_cost=float(pi.unit_cost),
                subtotal=float(pi.subtotal),
            )
            for pi in purchase.items
        ],
    )


@router.post("", response_model=PurchaseResponse, status_code=201)
def create_purchase(
    data: PurchaseCreate,
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    try:
        purchase = purchase_service.create_purchase(db, data, store_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return PurchaseResponse(
        id=purchase.id,
        supplier_id=purchase.supplier_id,
        supplier_name=purchase.supplier.name if purchase.supplier else None,
        total=float(purchase.total),
        status=purchase.status,
        notes=purchase.notes,
        created_at=purchase.created_at,
        item_count=len(purchase.items),
        items=[
            PurchaseItemResponse(
                id=pi.id,
                product_id=pi.product_id,
                product_name=pi.product.name if pi.product else None,
                quantity=pi.quantity,
                unit_cost=float(pi.unit_cost),
                subtotal=float(pi.subtotal),
            )
            for pi in purchase.items
        ],
    )


@router.delete("/{purchase_id}", status_code=200)
def delete_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    success = purchase_service.delete_purchase(db, purchase_id, store_id)
    if not success:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return {"message": "Purchase deleted successfully"}
