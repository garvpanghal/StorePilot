import re
from typing import Optional
from pydantic import BaseModel, field_validator, model_validator

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


PHONE_REGEX = re.compile(r"^(?:\+91|91|0)?[6-9]\d{9}$")


class RegisterRequest(BaseModel):
    email: str
    full_name: str
    phone: str
    shop_name: str
    business_type: Optional[str] = None
    business_address: Optional[str] = None
    password: str
    confirm_password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not EMAIL_REGEX.match(v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name cannot be blank")
        return v.strip()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Phone number is required")
        if not PHONE_REGEX.match(v):
            raise ValueError("Invalid Indian mobile number format")
        return v

    @field_validator("shop_name")
    @classmethod
    def validate_shop_name(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Shop / Business name cannot be blank")
        return v.strip()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        return v

    @model_validator(mode="after")
    def validate_passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self
