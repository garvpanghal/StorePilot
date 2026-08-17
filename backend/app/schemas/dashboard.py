from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class DashboardStats(BaseModel):
    total_revenue: float
    total_profit: float
    total_orders: int
    inventory_value: float
    inventory_health: float  # Percentage of healthy products
    revenue_change: Optional[float] = None
    profit_change: Optional[float] = None
    orders_change: Optional[float] = None


class SalesOverviewPoint(BaseModel):
    date: str
    current: float
    previous: float = 0


class TopProduct(BaseModel):
    id: int
    name: str
    total_sold: int
    revenue: float


class CategorySales(BaseModel):
    name: str
    value: float
    percentage: float


class RecentSale(BaseModel):
    invoice_number: str
    customer_name: str
    item_count: int
    total: float
    payment_method: str
    date: str


class DashboardData(BaseModel):
    stats: DashboardStats
    sales_overview: List[SalesOverviewPoint]
    top_products: List[TopProduct]
    category_sales: List[CategorySales]
    recent_sales: List[RecentSale]
