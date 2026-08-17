from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float


class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None  # For walk-in customers
    payment_method: str = "Cash"
    items: List[SaleItemCreate]
    notes: Optional[str] = None


class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: int
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True


class SaleResponse(BaseModel):
    id: int
    invoice_number: str
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    payment_method: str
    total: float
    status: str
    notes: Optional[str] = None
    created_at: datetime
    items: List[SaleItemResponse] = []
    item_count: int = 0

    class Config:
        from_attributes = True


class SaleListResponse(BaseModel):
    items: List[SaleResponse]
    total: int
    page: int
    page_size: int
    pages: int
