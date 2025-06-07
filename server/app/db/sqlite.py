import logging
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
    engine = create_async_engine(database_url, echo=settings.DEBUG, future=True)
    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    logger.info("Connected to SQLite database")

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

