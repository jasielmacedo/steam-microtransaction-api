"""Initialize database tables by importing all models."""
import logging

logger = logging.getLogger(__name__)

def import_all_models():
    """Import all models to register them with SQLAlchemy."""
    try:
        # Import all models to ensure they're registered with Base
        from app.api.models import (
            User, UserRole,
            Game,
            Product,
            Transaction,
            Settings,
            ApiKey,
        )
        
        logger.info("All models imported successfully")
        
        # Log which tables will be created
        from app.db.sqlite import Base
        logger.info(f"Tables to be created: {list(Base.metadata.tables.keys())}")
        
    except Exception as e:
        logger.error(f"Error importing models: {str(e)}")
        raise