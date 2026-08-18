from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from app.db.session import get_db
from app.api.deps import get_current_store_id
from app.schemas.report import ReportResponse
from app.services import report_service

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/sales", response_model=ReportResponse)
def sales_report(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    return report_service.sales_report(db, date_from, date_to, store_id)


@router.get("/products", response_model=ReportResponse)
def product_report(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    return report_service.product_performance_report(db, date_from, date_to, store_id)


@router.get("/inventory", response_model=ReportResponse)
def inventory_report(db: Session = Depends(get_db), store_id: int = Depends(get_current_store_id)):
    return report_service.inventory_report(db, store_id)


@router.get("/purchases", response_model=ReportResponse)
def purchase_report(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    return report_service.purchase_report(db, date_from, date_to, store_id)


@router.get("/profit", response_model=ReportResponse)
def profit_report(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    return report_service.profit_report(db, date_from, date_to, store_id)
