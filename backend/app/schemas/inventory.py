from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class InventoryAdjustment(BaseModel):
    product_id: int
    quantity: int  # positive for increase, negative for decrease
    notes: Optional[str] = None


class InventoryTransactionResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    transaction_type: str
    quantity: int
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class InventoryOverview(BaseModel):
    total_products: int
    total_stock_value: float
    low_stock_count: int
    critical_stock_count: int
    out_of_stock_count: int
    healthy_count: int


class LowStockProduct(BaseModel):
    id: int
    name: str
    sku: str
    current_stock: int
    reorder_level: int
    stock_status: str
    category_name: Optional[str] = None
