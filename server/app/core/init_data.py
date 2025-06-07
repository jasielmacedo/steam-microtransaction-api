import logging
import asyncio
from typing import Dict, Any

from app.api.models.user import User, UserRole
from app.core.config import settings

logger = logging.getLogger(__name__)


async def create_admin_user() -> Dict[str, Any]:
    """Create admin user if it doesn't exist."""
    try:
        # Check if admin user already exists
        admin = await User.get_by_email(settings.ADMIN_EMAIL)
        if admin is not None:
            logger.info(f"Admin user already exists with email: {settings.ADMIN_EMAIL}")
            return admin
        
        # Create admin user
        admin_data = {
            "name": settings.ADMIN_NAME,
            "email": settings.ADMIN_EMAIL,
            "password": settings.ADMIN_PASSWORD,
            "role": UserRole.ADMIN,
        }
        
        admin = await User.create(admin_data)
        
        # Generate API key for admin
        api_key = await User.generate_api_key(admin["_id"])
        
        logger.info(f"Admin user created with email: {settings.ADMIN_EMAIL} and API key: {api_key}")
        
        # Warning about default credentials
        if (
            settings.ADMIN_EMAIL == "admin@example.com"
            and settings.ADMIN_PASSWORD == "adminPassword123"
        ):
            logger.warning(
                "Default admin credentials are being used. Change them immediately in production!"
            )
        
        return admin
    except Exception as e:
        logger.error(f"Error creating admin user: {str(e)}")
        # Don't raise to allow startup to continue
        return None


async def init_data():
    """Initialize data in the database."""
    try:
        # Create admin user
        await create_admin_user()
        
        logger.info("Data initialization completed")
    except Exception as e:
        logger.error(f"Error initializing data: {str(e)}")
        # Don't re-raise to prevent app startup failure
        # The app should run even if initialization fails