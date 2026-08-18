from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import re

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.store import Store
from app.core.security import verify_password, hash_password
from app.schemas.user import UserResponse, UserUpdate, PasswordUpdate, StoreUpdate, OnboardingUpdate

router = APIRouter(prefix="/api/users", tags=["Users"])

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
PHONE_REGEX = re.compile(r"^(?:\+91|91|0)?[6-9]\d{9}$")


@router.put("/me", response_model=UserResponse)
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    email = data.email.strip().lower()
    if not EMAIL_REGEX.match(email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    if data.phone:
        phone = data.phone.strip()
        if not PHONE_REGEX.match(phone):
            raise HTTPException(status_code=400, detail="Invalid Indian mobile number format")
        current_user.phone = phone
    else:
        current_user.phone = None

    # Check email duplicate
    existing = db.query(User).filter(User.email == email, User.id != current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    current_user.full_name = data.full_name.strip()
    current_user.email = email

    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/password")
def change_password(
    data: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long")

    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"ok": True, "detail": "Password updated successfully"}


@router.put("/me/store", response_model=UserResponse)
def update_store(
    data: StoreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.store_id:
        raise HTTPException(status_code=404, detail="No store associated with this user")

    store = db.query(Store).filter(Store.id == current_user.store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    store.name = data.name.strip()
    store.business_type = data.business_type.strip() if data.business_type else None
    store.phone = data.phone.strip() if data.phone else None
    store.email = data.email.strip().lower() if data.email else None
    store.address = data.address.strip() if data.address else None

    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me")
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Prevent deleting the last administrator
    if current_user.role == "admin":
        admin_count = db.query(User).filter(User.role == "admin").count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete the final administrator account. At least one administrator is required to manage the system."
            )

    store_id = current_user.store_id
    if store_id:
        # Check if there are other users associated with the same store
        other_users_count = db.query(User).filter(
            User.store_id == store_id,
            User.id != current_user.id
        ).count()

        db.delete(current_user)

        if other_users_count == 0:
            # If no other users are associated, delete the store workspace (cascades database-wide)
            store = db.query(Store).filter(Store.id == store_id).first()
            if store:
                db.delete(store)
    else:
        db.delete(current_user)

    db.commit()
    return {"ok": True, "detail": "Account and all associated business data deleted successfully"}


@router.put("/me/onboarding")
def update_onboarding(
    data: OnboardingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.onboarding_completed = data.completed
    db.commit()
    return {"ok": True, "onboarding_completed": current_user.onboarding_completed}


@router.get("/me/checklist")
def get_checklist_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    store_id = current_user.store_id
    if not store_id:
        return {
            "store_setup": False,
            "add_product": False,
            "add_supplier": False,
            "record_purchase": False,
            "record_sale": False,
        }

    # 1. Store setup: check if the store has address, phone, and business_type
    store = current_user.store
    store_setup = bool(
        store
        and store.address
        and len(store.address.strip()) > 0
        and store.phone
        and len(store.phone.strip()) > 0
        and store.business_type
        and len(store.business_type.strip()) > 0
    )

    # 2. Add product: check if products exist for this store
    from app.models.product import Product
    add_product = db.query(Product).filter(Product.store_id == store_id).exists()
    add_product = db.query(add_product).scalar()

    # 3. Add supplier: check if suppliers exist
    from app.models.supplier import Supplier
    add_supplier = db.query(Supplier).filter(Supplier.store_id == store_id).exists()
    add_supplier = db.query(add_supplier).scalar()

    # 4. Record purchase: check if purchases exist
    from app.models.purchase import Purchase
    record_purchase = db.query(Purchase).filter(Purchase.store_id == store_id).exists()
    record_purchase = db.query(record_purchase).scalar()

    # 5. Record sale: check if sales exist
    from app.models.sale import Sale
    record_sale = db.query(Sale).filter(Sale.store_id == store_id).exists()
    record_sale = db.query(record_sale).scalar()

    return {
        "store_setup": store_setup,
        "add_product": add_product,
        "add_supplier": add_supplier,
        "record_purchase": record_purchase,
        "record_sale": record_sale,
    }

