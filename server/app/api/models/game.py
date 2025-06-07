import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.sqlite import Base
from app.core.exceptions import ConflictException, NotFoundException

class Game(Base):
    __tablename__ = "games"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    steam_app_id = Column(String, unique=True, index=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    @classmethod
    async def get_by_id(cls, session: AsyncSession, game_id: str):
        game = await session.get(cls, game_id)
        if not game:
            raise NotFoundException(f"Game with ID {game_id} not found")
        return game

    @classmethod
    async def get_by_steam_app_id(cls, session: AsyncSession, steam_app_id: str):
        stmt = select(cls).where(cls.steam_app_id == steam_app_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @classmethod
    async def create(cls, session: AsyncSession, data: dict):
        game = cls(
            name=data["name"],
            description=data.get("description"),
            steam_app_id=data.get("steam_app_id"),
            active=data.get("active", True),
        )
        session.add(game)
        try:
            await session.commit()
        except IntegrityError:
            await session.rollback()
            raise ConflictException("Game with this Steam App ID already exists")
        await session.refresh(game)
        return game

    @classmethod
    async def update(cls, session: AsyncSession, game_id: str, update_data: dict):
        game = await cls.get_by_id(session, game_id)
        for k, v in update_data.items():
            setattr(game, k, v)
        game.updated_at = datetime.utcnow()
        try:
            await session.commit()
        except IntegrityError:
            await session.rollback()
            raise ConflictException("Steam App ID already exists")
        await session.refresh(game)
        return game

    @classmethod
    async def delete(cls, session: AsyncSession, game_id: str):
        game = await cls.get_by_id(session, game_id)
        await session.delete(game)
        await session.commit()
        return True

    @classmethod
    async def get_many(cls, session: AsyncSession, skip: int = 0, limit: int = 10):
        stmt = select(cls).offset(skip).limit(limit)
        result = await session.execute(stmt)
        items = result.scalars().all()
        total = await session.execute(select(cls))
        total_count = len(total.scalars().all())
        return items, total_count

