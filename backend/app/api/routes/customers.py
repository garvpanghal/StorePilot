from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.deps import get_current_store_id
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerResponse

router = APIRouter(prefix="/api/customers", tags=["Customers"])


@router.get("", response_model=List[CustomerResponse])
def list_customers(db: Session = Depends(get_db), store_id: int = Depends(get_current_store_id)):
    return db.query(Customer).filter(Customer.store_id == store_id).order_by(Customer.name).all()


@router.post("", response_model=CustomerResponse, status_code=201)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db), store_id: int = Depends(get_current_store_id)):
    customer = Customer(**data.model_dump(), store_id=store_id)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer
