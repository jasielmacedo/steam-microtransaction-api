import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException, Path

from app.api.models.user import UserRole
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.models.transaction import Transaction
from app.db.sqlite import async_session
from app.api.schemas.transaction import (
    TransactionListResponse,
    TransactionDetailResponse,
    StatsResponse,
    ChartDataResponse,
    TopProductsResponse,
    RecentTransactionsResponse,
)
from app.core.exceptions import ForbiddenException
from app.core.security import get_current_user, authorize_user

logger = logging.getLogger(__name__)


async def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by status"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    steam_id: Optional[str] = Query(None, description="Filter by Steam ID"),
    app_id: Optional[str] = Query(None, description="Filter by App ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(async_session),
):
    """
    Get all transactions with filtering and pagination.
    Admin only.
    """
    # Ensure user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can access this endpoint")
    
    # Parse dates if provided
    date_start = None
    date_end = None
    
    if start_date:
        try:
            date_start = datetime.strptime(start_date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid start_date format. Use YYYY-MM-DD"
            )
    
    if end_date:
        try:
            date_end = datetime.strptime(end_date, "%Y-%m-%d")
            # Set to end of day
            date_end = datetime(date_end.year, date_end.month, date_end.day, 23, 59, 59)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid end_date format. Use YYYY-MM-DD"
            )
    
    try:
        # Get transactions
        transactions = await Transaction.get_all(session, skip=skip, limit=limit)
        
        # Return response
        return {
            "success": True,
            "count": len(transactions),
            "data": transactions
        }
    except Exception as e:
        logger.error(f"Error retrieving transactions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving transactions: {str(e)}"
        )


async def get_transaction(
    transaction_id: str = Path(..., description="Transaction ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(async_session),
):
    """
    Get transaction by ID.
    Admin only.
    """
    # Ensure user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can access this endpoint")
    
    try:
        # Get transaction
        transaction = await Transaction.get_by_id(session, transaction_id)
        
        # Return response
        return {
            "success": True,
            "data": transaction
        }
    except HTTPException as e:
        # Re-raise HTTP exceptions as they already have correct status codes
        raise e
    except Exception as e:
        logger.error(f"Error retrieving transaction {transaction_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction not found: {str(e)}"
        )


async def get_transaction_stats(
    days: int = Query(30, ge=1, le=365, description="Number of days to include in stats"),
    app_id: Optional[str] = Query(None, description="Filter by App ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Get transaction statistics for dashboard.
    Admin only.
    """
    # Ensure user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can access this endpoint")
    
    try:
        # Get stats
        stats = await Transaction.get_stats(days=days, app_id=app_id)
        
        # Return response
        return {
            "success": True,
            "data": stats
        }
    except Exception as e:
        logger.error(f"Error retrieving transaction statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving transaction statistics: {str(e)}"
        )


async def get_revenue_chart_data(
    days: int = Query(30, ge=1, le=365, description="Number of days to include"),
    app_id: Optional[str] = Query(None, description="Filter by App ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Get revenue chart data for dashboard.
    Admin only.
    """
    # Ensure user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can access this endpoint")
    
    try:
        # Get chart data
        chart_data = await Transaction.get_revenue_data(days=days, app_id=app_id)
        
        # Return response
        return {
            "success": True,
            "data": chart_data
        }
    except Exception as e:
        logger.error(f"Error retrieving revenue chart data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving revenue chart data: {str(e)}"
        )


async def get_top_products(
    limit: int = Query(5, ge=1, le=50, description="Number of products to include"),
    days: int = Query(30, ge=1, le=365, description="Number of days to include"),
    app_id: Optional[str] = Query(None, description="Filter by App ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Get top products for dashboard.
    Admin only.
    """
    # Ensure user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can access this endpoint")
    
    try:
        # Get top products
        top_products = await Transaction.get_top_products(
            limit=limit, days=days, app_id=app_id
        )
        
        # Return response
        return {
            "success": True,
            "data": top_products
        }
    except Exception as e:
        logger.error(f"Error retrieving top products: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving top products: {str(e)}"
        )


async def get_recent_transactions(
    limit: int = Query(5, ge=1, le=50, description="Number of transactions to include"),
    app_id: Optional[str] = Query(None, description="Filter by App ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Get recent transactions for dashboard.
    Admin only.
    """
    # Ensure user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can access this endpoint")
    
    try:
        # Get recent transactions
        transactions = await Transaction.get_recent_transactions(
            limit=limit,
            app_id=app_id,
        )
        
        # Return response
        return {
            "success": True,
            "data": transactions
        }
    except Exception as e:
        logger.error(f"Error retrieving recent transactions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving recent transactions: {str(e)}"
        )