import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.sqlite import Base
from app.core.exceptions import NotFoundException

class Settings(Base):
    __tablename__ = "settings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = Column(String, unique=True, index=True)
    data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    @classmethod
    async def get_by_team_id(cls, session: AsyncSession, team_id: str):
        stmt = select(cls).where(cls.team_id == team_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @classmethod
    async def create_or_update(cls, session: AsyncSession, team_id: str, data: dict):
        settings = await cls.get_by_team_id(session, team_id)
        if settings:
            settings.data = data
            settings.updated_at = datetime.utcnow()
        else:
            settings = cls(team_id=team_id, data=data)
            session.add(settings)
        await session.commit()
        await session.refresh(settings)
        return settings

