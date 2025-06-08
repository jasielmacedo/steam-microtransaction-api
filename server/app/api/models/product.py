import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, String, DateTime, Integer, Boolean, JSON
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.sqlite import Base
from app.core.exceptions import NotFoundException

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    price_cents = Column(Integer, nullable=False)
    type = Column(String, nullable=False)
    active = Column(Boolean, default=True)
    game_id = Column(String, nullable=True)
    steam_app_id = Column(String, nullable=True)
    steam_item_id = Column(Integer, nullable=True)
    product_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    @classmethod
    async def get_by_id(cls, session: AsyncSession, product_id: str):
        product = await session.get(cls, product_id)
        if not product:
            raise NotFoundException(f"Product with ID {product_id} not found")
        return product

    @classmethod
    async def get_all(cls, session: AsyncSession, skip: int = 0, limit: int = 100):
        stmt = select(cls).offset(skip).limit(limit)
        result = await session.execute(stmt)
        items = result.scalars().all()
        total = await session.execute(select(cls))
        total_count = len(total.scalars().all())
        return items, total_count

    @classmethod
    async def create(cls, session: AsyncSession, data: dict):
        product = cls(**data)
        session.add(product)
        await session.commit()
        await session.refresh(product)
        return product

    @classmethod
    async def update(cls, session: AsyncSession, product_id: str, update_data: dict):
        product = await cls.get_by_id(session, product_id)
        for k, v in update_data.items():
            setattr(product, k, v)
        product.updated_at = datetime.utcnow()
        await session.commit()
        await session.refresh(product)
        return product

    @classmethod
    async def delete(cls, session: AsyncSession, product_id: str):
        product = await cls.get_by_id(session, product_id)
        await session.delete(product)
        await session.commit()
        return True

