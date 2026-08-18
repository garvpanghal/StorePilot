from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.db.session import get_db
from app.api.deps import get_current_store_id
from app.models.product import Product
from app.models.sale import Sale
from app.models.purchase import Purchase
from app.models.supplier import Supplier
from app.models.customer import Customer

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.get("")
def global_search(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    limit = 5
    pattern = f"%{q}%"

    # 1. Search Products (only active ones belonging to the store)
    products_query = db.query(Product).filter(
        and_(
            Product.store_id == store_id,
            Product.is_active == True,
            or_(
                Product.name.ilike(pattern),
                Product.sku.ilike(pattern)
            )
        )
    ).limit(limit).all()

    # 2. Search Sales (belonging to the store)
    sales_query = db.query(Sale).outerjoin(Customer).filter(
        and_(
            Sale.store_id == store_id,
            or_(
                Sale.invoice_number.ilike(pattern),
                Customer.name.ilike(pattern)
            )
        )
    ).limit(limit).all()

    # 3. Search Purchases (belonging to the store)
    purchase_filters = [Supplier.name.ilike(pattern)]
    if q.isdigit():
        purchase_filters.append(Purchase.id == int(q))
    elif q.lower().startswith("po-") and q[3:].isdigit():
        purchase_filters.append(Purchase.id == int(q[3:]))
    elif q.lower().startswith("#") and q[1:].isdigit():
        purchase_filters.append(Purchase.id == int(q[1:]))

    purchases_query = db.query(Purchase).outerjoin(Supplier).filter(
        and_(
            Purchase.store_id == store_id,
            or_(*purchase_filters)
        )
    ).limit(limit).all()

    # 4. Search Suppliers (belonging to the store)
    suppliers_query = db.query(Supplier).filter(
        and_(
            Supplier.store_id == store_id,
            or_(
                Supplier.name.ilike(pattern),
                Supplier.contact_person.ilike(pattern),
                Supplier.email.ilike(pattern)
            )
        )
    ).limit(limit).all()

    # 5. Search Customers (belonging to the store)
    customers_query = db.query(Customer).filter(
        and_(
            Customer.store_id == store_id,
            or_(
                Customer.name.ilike(pattern),
                Customer.email.ilike(pattern),
                Customer.phone.ilike(pattern)
            )
        )
    ).limit(limit).all()

    return {
        "products": [
            {
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "selling_price": float(p.selling_price),
                "current_stock": p.current_stock,
            }
            for p in products_query
        ],
        "sales": [
            {
                "id": s.id,
                "invoice_number": s.invoice_number,
                "customer_name": s.customer.name if s.customer else "Walk-in Customer",
                "total": float(s.total),
                "created_at": s.created_at.isoformat(),
            }
            for s in sales_query
        ],
        "purchases": [
            {
                "id": p.id,
                "supplier_name": p.supplier.name if p.supplier else "Unknown Supplier",
                "total": float(p.total),
                "created_at": p.created_at.isoformat(),
            }
            for p in purchases_query
        ],
        "suppliers": [
            {
                "id": sup.id,
                "name": sup.name,
                "contact_person": sup.contact_person,
                "phone": sup.phone,
            }
            for sup in suppliers_query
        ],
        "customers": [
            {
                "id": c.id,
                "name": c.name,
                "email": c.email,
                "phone": c.phone,
            }
            for c in customers_query
        ]
    }
