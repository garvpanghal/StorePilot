import logging
import sys
from app.core.config import settings

def setup_logging() -> None:
    # Set default log level based on debug setting
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

    # Clean up third-party logging verbosity in dev/prod
    if not settings.DEBUG:
        logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
        logging.getLogger("alembic").setLevel(logging.INFO)
    else:
        # In debug mode, optionally set SQLAlchemy engines to INFO to see SQL queries (without sensitive parameters log)
        logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)
        logging.getLogger("alembic").setLevel(logging.DEBUG)

logger = logging.getLogger("storepilot")
