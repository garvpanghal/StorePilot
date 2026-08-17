"""Dashboard analytics service — all calculations from real database data."""
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models.sale import Sale, SaleItem
from app.models.product import Product
from app.models.category import Category
from app.models.purchase import Purchase
from app.schemas.dashboard import (
    DashboardStats, SalesOverviewPoint, TopProduct,
    CategorySales, RecentSale, DashboardData,
)


def _parse_period(period: str) -> tuple:
    """Convert period string to (start_date, end_date) in UTC."""
    now = datetime.now(timezone.utc)
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)

    if period == "today":
        return today, now
    elif period == "7d":
        return today - timedelta(days=7), now
    elif period == "30d":
        return today - timedelta(days=30), now
    elif period == "this_month":
        start = today.replace(day=1)
        return start, now
    elif period == "last_month":
        first_this_month = today.replace(day=1)
        last_month_end = first_this_month - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)
        return last_month_start, first_this_month
    else:
        # Default: last 30 days
        return today - timedelta(days=30), now


def get_dashboard_stats(db: Session, period: str = "30d") -> DashboardStats:
    start, end = _parse_period(period)

    # Current period revenue
    revenue = (
        db.query(func.coalesce(func.sum(Sale.total), 0))
        .filter(Sale.created_at >= start, Sale.created_at <= end, Sale.status == "completed")
        .scalar()
    )

    # Calculate profit from sale items in a single query by joining SaleItem with Product and Sale
    profit = (
        db.query(func.coalesce(func.sum((SaleItem.unit_price - Product.cost_price) * SaleItem.quantity), 0))
        .join(Sale, Sale.id == SaleItem.sale_id)
        .join(Product, Product.id == SaleItem.product_id)
        .filter(Sale.created_at >= start, Sale.created_at <= end, Sale.status == "completed")
        .scalar()
    )

    orders = (
        db.query(func.count(Sale.id))
        .filter(Sale.created_at >= start, Sale.created_at <= end, Sale.status == "completed")
        .scalar()
    )

    # Inventory value (only active products)
    products = db.query(Product).filter(Product.is_active == True).all()
    inv_value = sum(float(p.cost_price) * p.current_stock for p in products)

    # Inventory health (% of products with stock above reorder level)
    total_products = len(products)
    healthy = sum(1 for p in products if p.current_stock > p.reorder_level)
    health = round((healthy / total_products * 100) if total_products > 0 else 0, 1)

    # Previous period for % changes
    period_duration = (end - start).days or 1
    prev_start = start - timedelta(days=period_duration)
    prev_end = start

    prev_revenue = float(
        db.query(func.coalesce(func.sum(Sale.total), 0))
        .filter(Sale.created_at >= prev_start, Sale.created_at < prev_end, Sale.status == "completed")
        .scalar()
    )
    prev_orders = (
        db.query(func.count(Sale.id))
        .filter(Sale.created_at >= prev_start, Sale.created_at < prev_end, Sale.status == "completed")
        .scalar()
    )

    def pct_change(current, previous):
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return round(((current - previous) / previous) * 100, 1)

    return DashboardStats(
        total_revenue=round(float(revenue), 2),
        total_profit=round(float(profit), 2),
        total_orders=orders,
        inventory_value=round(inv_value, 2),
        inventory_health=health,
        revenue_change=pct_change(float(revenue), prev_revenue),
        profit_change=pct_change(float(profit), 0),  # Simplified
        orders_change=pct_change(orders, prev_orders),
    )


def get_sales_overview(db: Session, period: str = "30d") -> List[SalesOverviewPoint]:
    start, end = _parse_period(period)
    period_days = (end - start).days or 1
    prev_start = start - timedelta(days=period_days)

    # Single database query to load all completed sales in both current and previous periods
    sales = (
        db.query(Sale.created_at, Sale.total)
        .filter(Sale.created_at >= prev_start, Sale.created_at <= end, Sale.status == "completed")
        .all()
    )

    # Group sales totals by date in-memory (using UTC timezone dates)
    sales_by_date = {}
    for created_at, total in sales:
        created_at_utc = created_at.astimezone(timezone.utc)
        day = created_at_utc.date()
        sales_by_date[day] = sales_by_date.get(day, 0.0) + float(total)

    points = []
    # Group by date for the current period
    for day_offset in range(period_days + 1):
        day = (start + timedelta(days=day_offset)).date()
        current = sales_by_date.get(day, 0.0)

        # Previous period same day offset
        prev_day = (prev_start + timedelta(days=day_offset)).date()
        previous = sales_by_date.get(prev_day, 0.0)

        # Format date in a cross-platform way (strip leading zero if possible)
        date_str = day.strftime("%d %b")
        if date_str.startswith("0"):
            date_str = date_str[1:]

        points.append(SalesOverviewPoint(
            date=date_str,
            current=round(current, 2),
            previous=round(previous, 2),
        ))

    # Limit to reasonable number of points for chart
    if len(points) > 15:
        step = max(len(points) // 12, 1)
        points = points[::step]

    return points


def get_top_products(db: Session, period: str = "30d", limit: int = 5) -> List[TopProduct]:
    start, end = _parse_period(period)

    # One combined query to fetch total sold and revenue grouped by product_id and product_name
    results = (
        db.query(
            Product.id,
            Product.name,
            func.sum(SaleItem.quantity).label("total_sold"),
            func.sum(SaleItem.subtotal).label("revenue"),
        )
        .join(SaleItem, SaleItem.product_id == Product.id)
        .join(Sale, Sale.id == SaleItem.sale_id)
        .filter(Sale.created_at >= start, Sale.created_at <= end, Sale.status == "completed")
        .group_by(Product.id, Product.name)
        .order_by(func.sum(SaleItem.quantity).desc())
        .limit(limit)
        .all()
    )

    top = []
    for product_id, product_name, total_sold, revenue in results:
        top.append(TopProduct(
            id=product_id,
            name=product_name,
            total_sold=int(total_sold),
            revenue=round(float(revenue), 2),
        ))
    return top


def get_category_sales(db: Session, period: str = "30d") -> List[CategorySales]:
    start, end = _parse_period(period)

    results = (
        db.query(
            Category.name,
            func.coalesce(func.sum(SaleItem.subtotal), 0).label("revenue"),
        )
        .join(Product, Product.category_id == Category.id)
        .join(SaleItem, SaleItem.product_id == Product.id)
        .join(Sale, Sale.id == SaleItem.sale_id)
        .filter(Sale.created_at >= start, Sale.created_at <= end, Sale.status == "completed")
        .group_by(Category.name)
        .order_by(func.sum(SaleItem.subtotal).desc())
        .all()
    )

    total_revenue = sum(float(r.revenue) for r in results) or 1
    return [
        CategorySales(
            name=r.name,
            value=round(float(r.revenue), 2),
            percentage=round(float(r.revenue) / total_revenue * 100, 1),
        )
        for r in results
    ]


def get_recent_sales(db: Session, limit: int = 5) -> List[RecentSale]:
    sales = db.query(Sale).order_by(Sale.created_at.desc()).limit(limit).all()
    result = []
    for s in sales:
        customer_name = s.customer.name if s.customer else "Walk-in Customer"
        result.append(RecentSale(
            invoice_number=s.invoice_number,
            customer_name=customer_name,
            item_count=len(s.items),
            total=round(float(s.total), 2),
            payment_method=s.payment_method,
            date=s.created_at.strftime("%d %b, %I:%M %p") if s.created_at else "",
        ))
    return result


def get_full_dashboard(db: Session, period: str = "30d") -> DashboardData:
    return DashboardData(
        stats=get_dashboard_stats(db, period),
        sales_overview=get_sales_overview(db, period),
        top_products=get_top_products(db, period),
        category_sales=get_category_sales(db, period),
        recent_sales=get_recent_sales(db),
    )
