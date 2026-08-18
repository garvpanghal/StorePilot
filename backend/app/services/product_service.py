from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.product import Product
from app.models.category import Category
from app.models.supplier import Supplier
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
import math


def _to_response(p: Product) -> ProductResponse:
    return ProductResponse(
        id=p.id,
        name=p.name,
        sku=p.sku,
        category_id=p.category_id,
        category_name=p.category.name if p.category else None,
        supplier_id=p.supplier_id,
        supplier_name=p.supplier.name if p.supplier else None,
        description=p.description,
        selling_price=float(p.selling_price),
        cost_price=float(p.cost_price),
        current_stock=p.current_stock,
        reorder_level=p.reorder_level,
        stock_status=p.stock_status,
        is_active=p.is_active,
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


def list_products(
    db: Session,
    store_id: int,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    sort_by: str = "name",
    sort_order: str = "asc",
    page: int = 1,
    page_size: int = 50,
    include_archived: bool = False,
) -> ProductListResponse:
    query = db.query(Product).filter(Product.store_id == store_id)

    if not include_archived:
        query = query.filter(Product.is_active == True)

    # Search
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(pattern),
                Product.sku.ilike(pattern),
                Product.description.ilike(pattern),
            )
        )

    # Category filter
    if category_id:
        query = query.filter(Product.category_id == category_id)

    # Stock status filter
    if status_filter:
        sl = status_filter.lower()
        if sl == "in stock":
            query = query.filter(Product.current_stock > Product.reorder_level)
        elif sl == "low stock":
            query = query.filter(
                Product.current_stock > 0,
                Product.current_stock <= Product.reorder_level,
                Product.current_stock > Product.reorder_level * 0.5,
            )
        elif sl == "critical":
            query = query.filter(
                Product.current_stock > 0,
                Product.current_stock <= Product.reorder_level * 0.5,
            )
        elif sl == "out of stock":
            query = query.filter(Product.current_stock <= 0)

    # Total before pagination
    total = query.count()

    # Sorting
    sort_col = getattr(Product, sort_by, Product.name)
    if sort_order.lower() == "desc":
        sort_col = sort_col.desc()
    query = query.order_by(sort_col)

    # Pagination
    offset = (page - 1) * page_size
    products = query.offset(offset).limit(page_size).all()

    return ProductListResponse(
        items=[_to_response(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if page_size > 0 else 0,
    )


def get_product(db: Session, product_id: int, store_id: int) -> Optional[Product]:
    return db.query(Product).filter(Product.id == product_id, Product.store_id == store_id).first()


def create_product(db: Session, data: ProductCreate, store_id: int) -> Product:
    product = Product(**data.model_dump(), store_id=store_id)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, data: ProductUpdate, store_id: int) -> Optional[Product]:
    product = get_product(db, product_id, store_id)
    if not product:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int, store_id: int) -> str:
    product = get_product(db, product_id, store_id)
    if not product:
        return "not_found"

    from app.models.sale import SaleItem
    from app.models.purchase import PurchaseItem
    from app.models.inventory import InventoryTransaction

    has_sales = db.query(SaleItem).filter(SaleItem.product_id == product_id).first() is not None
    has_purchases = db.query(PurchaseItem).filter(PurchaseItem.product_id == product_id).first() is not None
    has_ledger = db.query(InventoryTransaction).filter(InventoryTransaction.product_id == product_id).first() is not None

    if has_sales or has_purchases or has_ledger:
        product.is_active = False
        db.commit()
        return "archived"
    else:
        db.delete(product)
        db.commit()
        return "deleted"
