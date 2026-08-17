from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ProductBase(BaseModel):
    name: str
    sku: str
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    description: Optional[str] = None
    selling_price: float = 0
    cost_price: float = 0
    current_stock: int = 0
    reorder_level: int = 10


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    description: Optional[str] = None
    selling_price: Optional[float] = None
    cost_price: Optional[float] = None
    reorder_level: Optional[int] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    description: Optional[str] = None
    selling_price: float
    cost_price: float
    current_stock: int
    reorder_level: int
    stock_status: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    pages: int
