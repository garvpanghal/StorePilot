"""
Purchase service — creates purchases with items, updates inventory via inventory_service.
Uses database transactions so partial failures don't corrupt inventory.
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.purchase import Purchase, PurchaseItem
from app.models.product import Product
from app.models.notification import Notification
from app.schemas.purchase import PurchaseCreate
from app.services import inventory_service
import math


def create_purchase(db: Session, data: PurchaseCreate, store_id: int) -> Purchase:
    """Create a purchase with items and update inventory atomically."""
    # Calculate totals
    total = 0
    purchase_items = []
    for item_data in data.items:
        product = db.query(Product).filter(Product.id == item_data.product_id, Product.store_id == store_id).first()
        if not product:
            raise ValueError(f"Product {item_data.product_id} not found")

        subtotal = round(item_data.quantity * item_data.unit_cost, 2)
        total += subtotal

        purchase_items.append({
            "product_id": item_data.product_id,
            "quantity": item_data.quantity,
            "unit_cost": item_data.unit_cost,
            "subtotal": subtotal,
        })

    # Create purchase record
    purchase = Purchase(
        store_id=store_id,
        supplier_id=data.supplier_id,
        total=round(total, 2),
        status="completed",
        notes=data.notes,
    )
    db.add(purchase)
    db.flush()  # Get the purchase ID

    # Create items and update inventory
    for item_dict in purchase_items:
        pi = PurchaseItem(
            purchase_id=purchase.id,
            **item_dict,
        )
        db.add(pi)

        # Stock in via inventory service
        inventory_service.stock_in(
            db=db,
            product_id=item_dict["product_id"],
            quantity=item_dict["quantity"],
            reference_type="purchase",
            reference_id=purchase.id,
            notes=f"Purchase #{purchase.id}",
            store_id=store_id,
        )

    # Notification
    notification = Notification(
        store_id=store_id,
        title="Purchase completed",
        message=f"Purchase #{purchase.id} completed. Total: ₹{total:,.2f}",
        type="success",
    )
    db.add(notification)

    db.commit()
    db.refresh(purchase)
    return purchase


def list_purchases(
    db: Session,
    store_id: int,
    page: int = 1,
    page_size: int = 50,
) -> dict:
    query = db.query(Purchase).filter(Purchase.store_id == store_id).order_by(Purchase.created_at.desc())
    total = query.count()
    purchases = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": purchases,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": math.ceil(total / page_size) if page_size > 0 else 0,
    }


def get_purchase(db: Session, purchase_id: int, store_id: int) -> Optional[Purchase]:
    return db.query(Purchase).filter(Purchase.id == purchase_id, Purchase.store_id == store_id).first()


def delete_purchase(db: Session, purchase_id: int, store_id: int) -> bool:
    """Delete a purchase and reverse inventory changes atomically."""
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id, Purchase.store_id == store_id).first()
    if not purchase:
        return False
    
    # Reverse inventory: Stock out the products that were purchased
    for item in purchase.items:
        inventory_service.stock_out(
            db=db,
            product_id=item.product_id,
            quantity=item.quantity,
            reference_type="purchase_deletion",
            reference_id=purchase_id,
            notes=f"Reversed Purchase #{purchase_id} due to deletion",
            allow_negative=True,  # Allow stock to drop below 0 if some was already sold
            store_id=store_id,
        )
    
    # Delete purchase (cascades to items)
    db.delete(purchase)
    db.commit()
    return True
