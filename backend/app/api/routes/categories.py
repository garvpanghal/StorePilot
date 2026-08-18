from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_store_id
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from typing import List

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db), store_id: int = Depends(get_current_store_id)):
    return db.query(Category).filter(Category.store_id == store_id).order_by(Category.name).all()


@router.post("", response_model=CategoryResponse, status_code=201)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), store_id: int = Depends(get_current_store_id)):
    existing = db.query(Category).filter(Category.name == data.name, Category.store_id == store_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Category already exists")
    cat = Category(**data.model_dump(), store_id=store_id)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    cat = db.query(Category).filter(Category.id == category_id, Category.store_id == store_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if duplicate name exists
    existing = db.query(Category).filter(
        Category.name == data.name, 
        Category.store_id == store_id,
        Category.id != category_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Another category with this name already exists")
        
    cat.name = data.name
    if data.description is not None:
        cat.description = data.description
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{category_id}", status_code=200)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    cat = db.query(Category).filter(Category.id == category_id, Category.store_id == store_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
        
    # Check if category has associated products
    from app.models.product import Product
    product_count = db.query(Product).filter(Product.category_id == category_id, Product.store_id == store_id).count()
    if product_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"This category is currently used by {product_count} products. Reassign or remove the category from these products before deleting it."
        )
        
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted successfully"}
