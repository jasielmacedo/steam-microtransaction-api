import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any

from sqlalchemy import Column, String, DateTime, Float, func, desc
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

    @classmethod
    async def get_stats(cls, session: AsyncSession) -> Dict[str, Any]:
        """Get transaction statistics."""
        try:
            # Total transactions
            total_count = await session.scalar(select(func.count(cls.id)))
            
            # Total revenue
            total_revenue = await session.scalar(select(func.sum(cls.amount))) or 0.0
            
            # Successful transactions
            successful_count = await session.scalar(
                select(func.count(cls.id)).where(cls.status == "completed")
            ) or 0
            
            # Pending transactions
            pending_count = await session.scalar(
                select(func.count(cls.id)).where(cls.status == "pending")
            ) or 0
            
            return {
                "total_transactions": total_count or 0,
                "total_revenue": total_revenue,
                "successful_transactions": successful_count,
                "pending_transactions": pending_count,
                "success_rate": (successful_count / total_count * 100) if total_count > 0 else 0
            }
        except Exception:
            return {
                "total_transactions": 0,
                "total_revenue": 0.0,
                "successful_transactions": 0,
                "pending_transactions": 0,
                "success_rate": 0
            }

    @classmethod
    async def get_revenue_data(cls, session: AsyncSession, days: int = 30) -> List[Dict[str, Any]]:
        """Get revenue data for the past N days."""
        try:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            stmt = select(
                func.date(cls.created_at).label("date"),
                func.sum(cls.amount).label("revenue"),
                func.count(cls.id).label("transactions")
            ).where(
                cls.created_at >= start_date,
                cls.status == "completed"
            ).group_by(func.date(cls.created_at)).order_by(func.date(cls.created_at))
            
            result = await session.execute(stmt)
            return [
                {
                    "date": row.date.isoformat() if row.date else None,
                    "revenue": float(row.revenue or 0),
                    "transactions": row.transactions or 0
                }
                for row in result
            ]
        except Exception:
            return []

    @classmethod
    async def get_top_products(cls, session: AsyncSession, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top products by revenue."""
        try:
            stmt = select(
                cls.product_id,
                func.sum(cls.amount).label("total_revenue"),
                func.count(cls.id).label("transaction_count")
            ).where(
                cls.status == "completed",
                cls.product_id.isnot(None)
            ).group_by(cls.product_id).order_by(desc("total_revenue")).limit(limit)
            
            result = await session.execute(stmt)
            return [
                {
                    "product_id": row.product_id,
                    "total_revenue": float(row.total_revenue or 0),
                    "transaction_count": row.transaction_count or 0
                }
                for row in result
            ]
        except Exception:
            return []

    @classmethod
    async def get_recent_transactions(cls, session: AsyncSession, limit: int = 10) -> List["Transaction"]:
        """Get recent transactions."""
        try:
            stmt = select(cls).order_by(desc(cls.created_at)).limit(limit)
            result = await session.execute(stmt)
            return result.scalars().all()
        except Exception:
            return []


