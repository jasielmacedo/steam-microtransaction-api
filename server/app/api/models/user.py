import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from passlib.context import CryptContext
from sqlalchemy import Column, String, DateTime
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.sqlite import Base
from app.core.exceptions import ConflictException, NotFoundException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default=UserRole.USER.value)
    steam_id = Column(String, nullable=True)
    api_key = Column(String, nullable=True, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    @classmethod
    async def get_by_id(cls, session: AsyncSession, user_id: str):
        result = await session.get(cls, user_id)
        if not result:
            raise NotFoundException(f"User with ID {user_id} not found")
        return result

    @classmethod
    async def get_by_email(cls, session: AsyncSession, email: str):
        stmt = select(cls).where(cls.email == email.lower())
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @classmethod
    async def get_by_api_key(cls, session: AsyncSession, api_key: str):
        stmt = select(cls).where(cls.api_key == api_key)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @classmethod
    async def create(cls, session: AsyncSession, user_data: dict):
        hashed_password = pwd_context.hash(user_data["password"])
        user = cls(
            email=user_data["email"].lower(),
            name=user_data["name"],
            password=hashed_password,
            role=user_data.get("role", UserRole.USER.value),
            steam_id=user_data.get("steam_id"),
            api_key=user_data.get("api_key"),
        )
        session.add(user)
        try:
            await session.commit()
        except IntegrityError:
            await session.rollback()
            raise ConflictException("User with this email already exists")
        await session.refresh(user)
        return user

    @classmethod
    async def update(cls, session: AsyncSession, user_id: str, update_data: dict):
        user = await cls.get_by_id(session, user_id)
        for key, value in update_data.items():
            if key == "password":
                value = pwd_context.hash(value)
            setattr(user, key, value)
        user.updated_at = datetime.utcnow()
        try:
            await session.commit()
        except IntegrityError:
            await session.rollback()
            raise ConflictException("Email is already in use")
        await session.refresh(user)
        return user

    @classmethod
    async def delete(cls, session: AsyncSession, user_id: str):
        user = await cls.get_by_id(session, user_id)
        await session.delete(user)
        await session.commit()
        return True

    @classmethod
    async def get_all(cls, session: AsyncSession, skip: int = 0, limit: int = 100):
        stmt = select(cls).offset(skip).limit(limit)
        result = await session.execute(stmt)
        return result.scalars().all()

    @classmethod
    def verify_password(cls, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @classmethod
    async def authenticate(cls, session: AsyncSession, email: str, password: str):
        user = await cls.get_by_email(session, email)
        if not user:
            return False
        if not cls.verify_password(password, user.password):
            return False
        return user

    @classmethod
    async def generate_api_key(cls, session: AsyncSession, user_id: str) -> str:
        import secrets
        import string
        alphabet = string.ascii_letters + string.digits
        api_key = "".join(secrets.choice(alphabet) for _ in range(40))
        await cls.update(session, user_id, {"api_key": api_key})
        return api_key

