import logging
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()
engine = None
AsyncSessionLocal = None

async def connect_to_db():
    global engine, AsyncSessionLocal
    database_url = f"sqlite+aiosqlite:///{settings.SQLITE_DB_PATH}"
    logger.info(f"Connecting to database at: {settings.SQLITE_DB_PATH}")
    
    engine = create_async_engine(database_url, echo=settings.DEBUG, future=True)
    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    # Log tables that will be created
    logger.info(f"Tables in metadata: {list(Base.metadata.tables.keys())}")
    
    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Tables created successfully")

        # Handle optional migrations
        try:
            result = await conn.execute(text("PRAGMA table_info(products);"))
            columns = [row[1] for row in result.fetchall()]
            if "steam_app_id" not in columns:
                logger.info("Adding steam_app_id column to products table")
                await conn.execute(text("ALTER TABLE products ADD COLUMN steam_app_id VARCHAR"))
        except Exception as e:
            logger.error(f"Error checking/updating products table: {e}")
    
    # Verify tables were created
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
        tables = result.fetchall()
        logger.info(f"Tables in database: {[table[0] for table in tables]}")
    
    logger.info("Connected to SQLite database and created tables")

async def close_db():
    global engine
    if engine:
        await engine.dispose()
        logger.info("SQLite connection closed")

async def async_session() -> AsyncSession:
    if AsyncSessionLocal is None:
        await connect_to_db()
    async with AsyncSessionLocal() as session:
        yield session

