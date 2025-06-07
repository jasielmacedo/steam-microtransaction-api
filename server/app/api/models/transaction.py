import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Float
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.sqlite import Base
from app.core.exceptions import NotFoundException

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String, unique=True, index=True)
    user_id = Column(String, nullable=True)
    product_id = Column(String, nullable=True)
    amount = Column(Float, default=0.0)
    currency = Column(String, default="USD")
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    @classmethod
    async def get_all(cls, session: AsyncSession, skip: int = 0, limit: int = 100):
        stmt = select(cls).offset(skip).limit(limit)
        result = await session.execute(stmt)
        return result.scalars().all()

    @classmethod
    async def get_by_id(cls, session: AsyncSession, tx_id: str):
        tx = await session.get(cls, tx_id)
        if not tx:
            raise NotFoundException(f"Transaction with ID {tx_id} not found")
        return tx

    @classmethod
    async def create(cls, session: AsyncSession, data: dict):
        tx = cls(**data)
        session.add(tx)
        await session.commit()
        await session.refresh(tx)
        return tx

    @classmethod
    async def update(cls, session: AsyncSession, tx_id: str, update_data: dict):
        tx = await cls.get_by_id(session, tx_id)
        for k, v in update_data.items():
            setattr(tx, k, v)
        tx.updated_at = datetime.utcnow()
        await session.commit()
        await session.refresh(tx)
        return tx


