from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.api.routes import api_router
from app.db.session import engine
from sqlalchemy import text

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup application logging
    setup_logging()
    logger.info("Initializing StorePilot Backend Foundation...")
    logger.info(f"App Environment: {settings.APP_ENV}")
    logger.info(f"Debug Mode: {settings.DEBUG}")
    logger.info(f"Configured CORS Origins: {settings.CORS_ORIGINS}")
    
    # Verify Database connectivity on startup (log warning/error on failure, do not crash app)
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("Database connection verified successfully.")
    except Exception as e:
        logger.error(f"Database connection verification failed on startup: {str(e)}")
        logger.warning("The application is starting up but the database is currently unreachable.")

    yield
    
    logger.info("Shutting down StorePilot Backend...")

app = FastAPI(
    title="StorePilot API",
    description="Backend foundation API for StorePilot retail management platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global unhandled exception handler to return clean consistent errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error in request path {request.url.path}: {str(exc)}", exc_info=settings.DEBUG)
    
    # Hide details in production environment
    message = str(exc) if settings.DEBUG else "An unexpected error occurred. Please try again later."
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": message
            }
        }
    )

# Register API routes
app.include_router(api_router)
