import logging
import asyncio
from typing import Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from app.api.models.user import User, UserRole
from app.core.config import settings
from app.db.sqlite import AsyncSessionLocal

logger = logging.getLogger(__name__)


async def create_admin_user(session_factory=None) -> Dict[str, Any]:
    """Create admin user if it doesn't exist."""
    try:
        logger.info(f"Attempting to create admin user with email: {settings.ADMIN_EMAIL}")
        # Use provided session factory or fallback to global
        session_local = session_factory or AsyncSessionLocal
        if session_local is None:
            raise RuntimeError("Database session not initialized")
        
        async with session_local() as session:
            # Check if admin user already exists
            admin = await User.get_by_email(session, settings.ADMIN_EMAIL)
            if admin is not None:
                logger.info(
                    f"Admin user already exists with email: {settings.ADMIN_EMAIL}"
                )
                return admin

            # Create admin user
            admin_data = {
                "name": settings.ADMIN_NAME,
                "email": settings.ADMIN_EMAIL,
                "password": settings.ADMIN_PASSWORD,
                "role": UserRole.ADMIN,
            }

            logger.info(f"Creating admin user with data: {admin_data}")
            admin = await User.create(session, admin_data)
            logger.info(f"Admin user created successfully with ID: {admin.id}")

            # Generate API key for admin
            api_key = await User.generate_api_key(session, admin.id)

            logger.info(
                f"Admin user created with email: {settings.ADMIN_EMAIL} and API key: {api_key}"
            )

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


async def init_data(session_factory=None):
    """Initialize data in the database."""
    try:
        # Create admin user
        await create_admin_user(session_factory)
        
        logger.info("Data initialization completed")
    except Exception as e:
        logger.error(f"Error initializing data: {str(e)}")
        # Don't re-raise to prevent app startup failure
        # The app should run even if initialization fails