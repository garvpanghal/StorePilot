from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class PurchaseItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_cost: float


class PurchaseCreate(BaseModel):
    supplier_id: int
    items: List[PurchaseItemCreate]
    notes: Optional[str] = None


class PurchaseItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: int
    unit_cost: float
    subtotal: float

    class Config:
        from_attributes = True


class PurchaseResponse(BaseModel):
    id: int
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    total: float
    status: str
    notes: Optional[str] = None
    created_at: datetime
    items: List[PurchaseItemResponse] = []
    item_count: int = 0

    class Config:
        from_attributes = True


class PurchaseListResponse(BaseModel):
    items: List[PurchaseResponse]
    total: int
    page: int
    page_size: int
    pages: int
