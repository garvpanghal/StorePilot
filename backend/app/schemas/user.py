from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class StoreResponse(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    business_type: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    store_id: Optional[int] = None
    store: Optional[StoreResponse] = None
    onboarding_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str


class StoreUpdate(BaseModel):
    name: str
    business_type: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


class OnboardingUpdate(BaseModel):
    completed: bool

