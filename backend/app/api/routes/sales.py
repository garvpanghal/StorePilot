from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.sale import SaleCreate, SaleResponse, SaleListResponse
from app.services import sale_service

router = APIRouter(prefix="/api/sales", tags=["Sales"])


@router.get("", response_model=SaleListResponse)
def list_sales(
    page: int = 1,
    page_size: int = 50,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    result = sale_service.list_sales(db, page, page_size, date_from, date_to)
    items = []
    for s in result["items"]:
        items.append(SaleResponse(
            id=s.id,
            invoice_number=s.invoice_number,
            customer_id=s.customer_id,
            customer_name=s.customer.name if s.customer else "Walk-in Customer",
            payment_method=s.payment_method,
            total=float(s.total),
            status=s.status,
            notes=s.notes,
            created_at=s.created_at,
            items=[],
            item_count=len(s.items),
        ))
    return SaleListResponse(
        items=items,
        total=result["total"],
        page=result["page"],
        page_size=result["page_size"],
        pages=result["pages"],
    )


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(sale_id: int, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    sale = sale_service.get_sale(db, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    from app.schemas.sale import SaleItemResponse
    return SaleResponse(
        id=sale.id,
        invoice_number=sale.invoice_number,
        customer_id=sale.customer_id,
        customer_name=sale.customer.name if sale.customer else "Walk-in Customer",
        payment_method=sale.payment_method,
        total=float(sale.total),
        status=sale.status,
        notes=sale.notes,
        created_at=sale.created_at,
        item_count=len(sale.items),
        items=[
            SaleItemResponse(
                id=si.id,
                product_id=si.product_id,
                product_name=si.product.name if si.product else None,
                quantity=si.quantity,
                unit_price=float(si.unit_price),
                subtotal=float(si.subtotal),
            )
            for si in sale.items
        ],
    )


@router.post("", response_model=SaleResponse, status_code=201)
def create_sale(data: SaleCreate, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    try:
        sale = sale_service.create_sale(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    from app.schemas.sale import SaleItemResponse
    return SaleResponse(
        id=sale.id,
        invoice_number=sale.invoice_number,
        customer_id=sale.customer_id,
        customer_name=sale.customer.name if sale.customer else "Walk-in Customer",
        payment_method=sale.payment_method,
        total=float(sale.total),
        status=sale.status,
        notes=sale.notes,
        created_at=sale.created_at,
        item_count=len(sale.items),
        items=[
            SaleItemResponse(
                id=si.id,
                product_id=si.product_id,
                product_name=si.product.name if si.product else None,
                quantity=si.quantity,
                unit_price=float(si.unit_price),
                subtotal=float(si.subtotal),
            )
            for si in sale.items
        ],
    )
