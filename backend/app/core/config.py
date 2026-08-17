import json
import os
from typing import Annotated, Any, List, Optional
from pydantic import BeforeValidator, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

def parse_cors_origins(v: Any) -> List[str]:
    if isinstance(v, str):
        # Support JSON list format: '["http://localhost:5173"]'
        if v.startswith("[") and v.endswith("]"):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                pass
        # Support comma-separated format: 'http://localhost:5173,http://127.0.0.1:5173'
        return [origin.strip() for origin in v.split(",") if origin.strip()]
    if isinstance(v, list):
        return [str(item) for item in v]
    return []

CorsOrigins = Annotated[List[str], BeforeValidator(parse_cors_origins)]

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    DATABASE_URL: str = "postgresql+psycopg://postgres:password@localhost:5432/storepilot"
    APP_ENV: str = "development"
    DEBUG: bool = True
    CORS_ORIGINS: CorsOrigins = Field(default=["http://localhost:5173"])

    # Authentication
    SECRET_KEY: str = "change-me-in-production-use-a-long-random-string"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    # AI / Gemini
    GEMINI_API_KEY: Optional[str] = None

settings = Settings()
