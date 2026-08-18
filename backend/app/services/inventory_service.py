"""
Central inventory service — ALL stock changes go through here.
This is the single source of truth for inventory mutations.
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.product import Product
from app.models.inventory import InventoryTransaction
from app.models.notification import Notification


def stock_in(
    db: Session,
    product_id: int,
    quantity: int,
    reference_type: Optional[str] = None,
    reference_id: Optional[int] = None,
    notes: Optional[str] = None,
    store_id: Optional[int] = None,
) -> InventoryTransaction:
    """Increase stock for a product. Used by purchases and manual adjustments."""
    product = db.query(Product).filter(Product.id == product_id, Product.store_id == store_id).first()
    if not product:
        raise ValueError(f"Product {product_id} not found")

    product.current_stock += quantity

    txn = InventoryTransaction(
        product_id=product_id,
        store_id=store_id,
        transaction_type="stock_in",
        quantity=quantity,
        reference_type=reference_type,
        reference_id=reference_id,
        notes=notes,
    )
    db.add(txn)
    return txn


def stock_out(
    db: Session,
    product_id: int,
    quantity: int,
    reference_type: Optional[str] = None,
    reference_id: Optional[int] = None,
    notes: Optional[str] = None,
    allow_negative: bool = False,
    store_id: Optional[int] = None,
) -> InventoryTransaction:
    """Decrease stock for a product. Used by sales."""
    product = db.query(Product).filter(Product.id == product_id, Product.store_id == store_id).first()
    if not product:
        raise ValueError(f"Product {product_id} not found")

    if not allow_negative and product.current_stock < quantity:
        raise ValueError(
            f"Insufficient stock for '{product.name}': available={product.current_stock}, requested={quantity}"
        )

    product.current_stock -= quantity

    txn = InventoryTransaction(
        product_id=product_id,
        store_id=store_id,
        transaction_type="stock_out",
        quantity=quantity,
        reference_type=reference_type,
        reference_id=reference_id,
        notes=notes,
    )
    db.add(txn)

    # Check for low stock notifications
    _check_low_stock(db, product, store_id)

    return txn


def adjust_stock(
    db: Session,
    product_id: int,
    quantity: int,
    notes: Optional[str] = None,
    store_id: Optional[int] = None,
) -> InventoryTransaction:
    """Manual stock adjustment. Positive = increase, negative = decrease."""
    product = db.query(Product).filter(Product.id == product_id, Product.store_id == store_id).first()
    if not product:
        raise ValueError(f"Product {product_id} not found")

    product.current_stock += quantity

    txn_type = "stock_in" if quantity >= 0 else "stock_out"
    txn = InventoryTransaction(
        product_id=product_id,
        store_id=store_id,
        transaction_type="adjustment",
        quantity=abs(quantity),
        reference_type="manual",
        notes=notes,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)

    _check_low_stock(db, product, store_id)

    return txn


def get_inventory_overview(db: Session, store_id: int) -> dict:
    """Get inventory health overview stats."""
    products = db.query(Product).filter(Product.store_id == store_id).all()
    total = len(products)
    if total == 0:
        return {
            "total_products": 0,
            "total_stock_value": 0,
            "low_stock_count": 0,
            "critical_stock_count": 0,
            "out_of_stock_count": 0,
            "healthy_count": 0,
        }

    stock_value = sum(float(p.cost_price) * p.current_stock for p in products)
    out = sum(1 for p in products if p.current_stock <= 0)
    critical = sum(
        1 for p in products if 0 < p.current_stock <= p.reorder_level * 0.5
    )
    low = sum(
        1
        for p in products
        if p.reorder_level * 0.5 < p.current_stock <= p.reorder_level
    )
    healthy = total - out - critical - low

    return {
        "total_products": total,
        "total_stock_value": round(stock_value, 2),
        "low_stock_count": low,
        "critical_stock_count": critical,
        "out_of_stock_count": out,
        "healthy_count": healthy,
    }


def get_low_stock_products(db: Session, store_id: int) -> List[Product]:
    """Get products at or below reorder level."""
    return (
        db.query(Product)
        .filter(Product.current_stock <= Product.reorder_level, Product.store_id == store_id)
        .order_by(Product.current_stock.asc())
        .all()
    )


def get_transaction_history(
    db: Session,
    store_id: int,
    product_id: Optional[int] = None,
    limit: int = 100,
) -> List[InventoryTransaction]:
    """Get inventory transaction history."""
    query = db.query(InventoryTransaction).filter(InventoryTransaction.store_id == store_id)
    if product_id:
        query = query.filter(InventoryTransaction.product_id == product_id)
    return query.order_by(InventoryTransaction.created_at.desc()).limit(limit).all()


def _check_low_stock(db: Session, product: Product, store_id: Optional[int]):
    """Generate notification if product hits low/critical stock."""
    if product.current_stock <= 0:
        _create_stock_notification(
            db, product, "danger",
            f"{product.name} is OUT OF STOCK!",
            f"Stock for {product.name} (SKU: {product.sku}) has reached zero. Immediate reorder required.",
            store_id
        )
    elif product.current_stock <= product.reorder_level * 0.5:
        _create_stock_notification(
            db, product, "danger",
            f"Critical stock: {product.name}",
            f"{product.name} has only {product.current_stock} units left (reorder level: {product.reorder_level}).",
            store_id
        )
    elif product.current_stock <= product.reorder_level:
        _create_stock_notification(
            db, product, "warning",
            f"Low stock: {product.name}",
            f"{product.name} stock is low at {product.current_stock} units (reorder level: {product.reorder_level}).",
            store_id
        )


def _create_stock_notification(db: Session, product: Product, ntype: str, title: str, message: str, store_id: Optional[int]):
    notification = Notification(
        store_id=store_id,
        title=title,
        message=message,
        type=ntype,
    )
    db.add(notification)
