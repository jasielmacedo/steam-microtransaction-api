import uuid
from datetime import datetime

from passlib.context import CryptContext
from sqlalchemy import Column, String, DateTime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.sqlite import Base
from app.core.exceptions import NotFoundException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    prefix = Column(String, nullable=False)
    hashed_key = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used = Column(DateTime, nullable=True)
    user_id = Column(String, nullable=False, index=True)

    @classmethod
    async def get_by_user(cls, session: AsyncSession, user_id: str):
        stmt = select(cls).where(cls.user_id == user_id)
        result = await session.execute(stmt)
        return result.scalars().all()

    @classmethod
    async def get_by_id(cls, session: AsyncSession, key_id: str, user_id: str):
        stmt = select(cls).where(cls.id == key_id, cls.user_id == user_id)
        result = await session.execute(stmt)
        key = result.scalar_one_or_none()
        if not key:
            raise NotFoundException("API key not found")
        return key

    @classmethod
    async def create(
        cls, session: AsyncSession, user_id: str, name: str, prefix: str
    ) -> tuple["ApiKey", str]:
        import secrets
        import string

        alphabet = string.ascii_letters + string.digits
        secret = "".join(secrets.choice(alphabet) for _ in range(32))
        plain_key = f"{prefix}{secret}"
        hashed = pwd_context.hash(plain_key)

        key = cls(
            name=name,
            prefix=prefix,
            hashed_key=hashed,
            user_id=user_id,
        )
        session.add(key)
        await session.commit()
        await session.refresh(key)
        return key, plain_key

    @classmethod
    async def rotate(
        cls, session: AsyncSession, key_id: str, user_id: str
    ) -> tuple["ApiKey", str]:
        import secrets
        import string

        key = await cls.get_by_id(session, key_id, user_id)
        alphabet = string.ascii_letters + string.digits
        secret = "".join(secrets.choice(alphabet) for _ in range(32))
        plain_key = f"{key.prefix}{secret}"
        key.hashed_key = pwd_context.hash(plain_key)
        key.last_used = None
        await session.commit()
        await session.refresh(key)
        return key, plain_key

    @classmethod
    async def delete(cls, session: AsyncSession, key_id: str, user_id: str) -> bool:
        key = await cls.get_by_id(session, key_id, user_id)
        await session.delete(key)
        await session.commit()
        return True
