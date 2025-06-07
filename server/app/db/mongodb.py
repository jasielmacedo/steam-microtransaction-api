import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure

from app.core.config import settings
from app.core.exceptions import BaseAPIException

logger = logging.getLogger(__name__)

# Global variables for database connection
client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_to_mongo():
    """Create database connection."""
    global client, db
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=5000)
        
        # Verify connection is established
        await client.admin.command("ismaster")
        
        db = client[settings.MONGODB_DB_NAME]
        logger.info("Connected to MongoDB successfully")
        
        # Create indexes for collections
        await create_indexes()
        
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        logger.error(f"MongoDB connection error: {str(e)}")
        raise BaseAPIException(message="Database connection error", status_code=500)


async def close_mongo_connection():
    """Close database connection."""
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed")


async def create_indexes():
    """Create indexes for collections."""
    # Users collection
    await db.users.create_index("email", unique=True)
    await db.users.create_index("api_key", unique=True, sparse=True)
    
    # Transactions collection (if used)
    await db.transactions.create_index([("app_id", 1), ("order_id", 1)], unique=True)
    await db.transactions.create_index("steam_id")
    await db.transactions.create_index("created_at")


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance."""
    global db
    if db is None:
        raise BaseAPIException(message="Database not initialized", status_code=500)
    return db