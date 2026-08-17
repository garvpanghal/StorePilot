"""
Sale service — creates sales with items, updates inventory via inventory_service.
Uses database transactions. Prevents selling more stock than available.
"""
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.sale import Sale, SaleItem
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.sale import SaleCreate
from app.services import inventory_service
import math
from datetime import datetime, timezone


def _generate_invoice_number(db: Session) -> str:
    """Generate next invoice number like INV-1001, INV-1002, etc."""
    last = db.query(Sale).order_by(Sale.id.desc()).first()
    next_num = (last.id + 1) if last else 1
    return f"INV-{1000 + next_num}"


def create_sale(db: Session, data: SaleCreate) -> Sale:
    """Create a sale with items and update inventory atomically."""
    # Resolve customer
    customer_id = data.customer_id
    if not customer_id and data.customer_name:
        # Create or find walk-in customer
        customer = (
            db.query(Customer).filter(Customer.name == data.customer_name).first()
        )
        if not customer:
            customer = Customer(name=data.customer_name)
            db.add(customer)
            db.flush()
        customer_id = customer.id

    # Validate stock and calculate totals
    total = 0
    sale_items = []
    for item_data in data.items:
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if not product:
            raise ValueError(f"Product {item_data.product_id} not found")
        if product.current_stock < item_data.quantity:
            raise ValueError(
                f"Insufficient stock for '{product.name}': "
                f"available={product.current_stock}, requested={item_data.quantity}"
            )

        subtotal = round(item_data.quantity * item_data.unit_price, 2)
        total += subtotal

        sale_items.append({
            "product_id": item_data.product_id,
            "quantity": item_data.quantity,
            "unit_price": item_data.unit_price,
            "subtotal": subtotal,
        })

    invoice_number = _generate_invoice_number(db)

    sale = Sale(
        invoice_number=invoice_number,
        customer_id=customer_id,
        payment_method=data.payment_method,
        total=round(total, 2),
        status="completed",
        notes=data.notes,
    )
    db.add(sale)
    db.flush()

    # Create items and update inventory
    for item_dict in sale_items:
        si = SaleItem(sale_id=sale.id, **item_dict)
        db.add(si)

        inventory_service.stock_out(
            db=db,
            product_id=item_dict["product_id"],
            quantity=item_dict["quantity"],
            reference_type="sale",
            reference_id=sale.id,
            notes=f"Sale {invoice_number}",
        )

    db.commit()
    db.refresh(sale)
    return sale


def list_sales(
    db: Session,
    page: int = 1,
    page_size: int = 50,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
) -> dict:
    query = db.query(Sale).order_by(Sale.created_at.desc())

    if date_from:
        query = query.filter(Sale.created_at >= date_from)
    if date_to:
        query = query.filter(Sale.created_at <= date_to)

    total = query.count()
    sales = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": sales,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": math.ceil(total / page_size) if page_size > 0 else 0,
    }


def get_sale(db: Session, sale_id: int) -> Optional[Sale]:
    return db.query(Sale).filter(Sale.id == sale_id).first()
