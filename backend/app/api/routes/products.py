from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.services import product_service

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("", response_model=ProductListResponse)
def list_products(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    status: Optional[str] = Query(None, alias="status"),
    sort_by: str = "name",
    sort_order: str = "asc",
    page: int = 1,
    page_size: int = 50,
    include_archived: bool = False,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return product_service.list_products(
        db, search=search, category_id=category_id,
        status_filter=status, sort_by=sort_by, sort_order=sort_order,
        page=page, page_size=page_size, include_archived=include_archived,
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_service._to_response(product)


@router.post("", response_model=ProductResponse, status_code=201)
def create_product(data: ProductCreate, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    product = product_service.create_product(db, data)
    return product_service._to_response(product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    product = product_service.update_product(db, product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_service._to_response(product)


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    result = product_service.delete_product(db, product_id)
    if result == "not_found":
        raise HTTPException(status_code=404, detail="Product not found")
    return {"action": result}
