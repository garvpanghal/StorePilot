from datetime import datetime, timedelta, timezone, date, time
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.sale import Sale, SaleItem
from app.models.product import Product
from app.models.category import Category
from app.models.purchase import Purchase, PurchaseItem
from app.models.inventory import InventoryTransaction
from app.schemas.report import ReportResponse


def _date_filter(query, model, date_from: Optional[date], date_to: Optional[date]):
    if date_from:
        start_dt = datetime.combine(date_from, time.min).replace(tzinfo=timezone.utc)
        query = query.filter(model.created_at >= start_dt)
    if date_to:
        end_dt = datetime.combine(date_to, time.min).replace(tzinfo=timezone.utc) + timedelta(days=1)
        query = query.filter(model.created_at < end_dt)
    return query


def sales_report(db: Session, date_from: Optional[date] = None, date_to: Optional[date] = None) -> ReportResponse:
    query = db.query(Sale).filter(Sale.status == "completed")
    query = _date_filter(query, Sale, date_from, date_to)
    sales = query.order_by(Sale.created_at.desc()).all()

    rows = []
    total_revenue = 0
    for s in sales:
        total_revenue += float(s.total)
        rows.append({
            "invoice": s.invoice_number,
            "customer": s.customer.name if s.customer else "Walk-in",
            "items": len(s.items),
            "total": round(float(s.total), 2),
            "payment": s.payment_method,
            "date": s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else "",
        })

    return ReportResponse(
        title="Sales Report",
        columns=["Invoice", "Customer", "Items", "Total (₹)", "Payment", "Date"],
        rows=rows,
        summary={"total_sales": len(rows), "total_revenue": round(total_revenue, 2)},
    )


def product_performance_report(db: Session, date_from: Optional[date] = None, date_to: Optional[date] = None) -> ReportResponse:
    query = (
        db.query(
            Product.name,
            Product.sku,
            func.coalesce(func.sum(SaleItem.quantity), 0).label("units_sold"),
            func.coalesce(func.sum(SaleItem.subtotal), 0).label("revenue"),
        )
        .outerjoin(SaleItem, SaleItem.product_id == Product.id)
        .outerjoin(Sale, Sale.id == SaleItem.sale_id)
    )
    if date_from:
        query = query.filter(Sale.created_at >= date_from)
    if date_to:
        query = query.filter(Sale.created_at <= date_to)

    results = query.group_by(Product.id, Product.name, Product.sku).order_by(func.sum(SaleItem.quantity).desc().nulls_last()).all()

    rows = []
    for r in results:
        rows.append({
            "product": r.name,
            "sku": r.sku,
            "units_sold": int(r.units_sold or 0),
            "revenue": round(float(r.revenue or 0), 2),
        })

    return ReportResponse(
        title="Product Performance Report",
        columns=["Product", "SKU", "Units Sold", "Revenue (₹)"],
        rows=rows,
        summary={"total_products": len(rows)},
    )


def inventory_report(db: Session) -> ReportResponse:
    products = db.query(Product).order_by(Product.name).all()
    rows = []
    total_value = 0
    for p in products:
        value = float(p.cost_price) * p.current_stock
        total_value += value
        rows.append({
            "product": p.name,
            "sku": p.sku,
            "category": p.category.name if p.category else "",
            "stock": p.current_stock,
            "reorder_level": p.reorder_level,
            "status": p.stock_status,
            "cost_price": round(float(p.cost_price), 2),
            "stock_value": round(value, 2),
        })

    return ReportResponse(
        title="Inventory Report",
        columns=["Product", "SKU", "Category", "Stock", "Reorder Level", "Status", "Cost Price (₹)", "Stock Value (₹)"],
        rows=rows,
        summary={"total_products": len(rows), "total_stock_value": round(total_value, 2)},
    )


def purchase_report(db: Session, date_from: Optional[date] = None, date_to: Optional[date] = None) -> ReportResponse:
    query = db.query(Purchase)
    query = _date_filter(query, Purchase, date_from, date_to)
    purchases = query.order_by(Purchase.created_at.desc()).all()

    rows = []
    total_spent = 0
    for p in purchases:
        total_spent += float(p.total)
        rows.append({
            "id": p.id,
            "supplier": p.supplier.name if p.supplier else "",
            "items": len(p.items),
            "total": round(float(p.total), 2),
            "status": p.status,
            "date": p.created_at.strftime("%Y-%m-%d %H:%M") if p.created_at else "",
        })

    return ReportResponse(
        title="Purchase Report",
        columns=["ID", "Supplier", "Items", "Total (₹)", "Status", "Date"],
        rows=rows,
        summary={"total_purchases": len(rows), "total_spent": round(total_spent, 2)},
    )


def profit_report(db: Session, date_from: Optional[date] = None, date_to: Optional[date] = None) -> ReportResponse:
    query = db.query(Sale).filter(Sale.status == "completed")
    query = _date_filter(query, Sale, date_from, date_to)
    sales = query.all()

    rows = []
    total_revenue = 0
    total_cost = 0
    for s in sales:
        sale_revenue = float(s.total)
        sale_cost = 0
        for item in s.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                sale_cost += float(product.cost_price) * item.quantity
        profit = sale_revenue - sale_cost
        total_revenue += sale_revenue
        total_cost += sale_cost
        rows.append({
            "invoice": s.invoice_number,
            "revenue": round(sale_revenue, 2),
            "cost": round(sale_cost, 2),
            "profit": round(profit, 2),
            "margin": round((profit / sale_revenue * 100) if sale_revenue > 0 else 0, 1),
            "date": s.created_at.strftime("%Y-%m-%d") if s.created_at else "",
        })

    return ReportResponse(
        title="Profit Report",
        columns=["Invoice", "Revenue (₹)", "Cost (₹)", "Profit (₹)", "Margin (%)", "Date"],
        rows=rows,
        summary={
            "total_revenue": round(total_revenue, 2),
            "total_cost": round(total_cost, 2),
            "total_profit": round(total_revenue - total_cost, 2),
            "avg_margin": round(((total_revenue - total_cost) / total_revenue * 100) if total_revenue > 0 else 0, 1),
        },
    )
