import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Union
from bson import ObjectId
from fastapi import HTTPException, status
from pymongo import DESCENDING, ASCENDING

from app.db.mongodb import get_database
from app.utils.notifications import NotificationManager, NotificationType

logger = logging.getLogger(__name__)


class Transaction:
    """Transaction model for database operations and analytics."""
    
    # Collection name in MongoDB
    collection_name = "transactions"
    
    @classmethod
    def get_collection(cls):
        """Get transaction collection."""
        return get_database()[cls.collection_name]
    
    @classmethod
    async def get_all(
        cls, 
        skip: int = 0, 
        limit: int = 100, 
        status_filter: Optional[str] = None,
        date_start: Optional[datetime] = None,
        date_end: Optional[datetime] = None,
        user_id: Optional[str] = None,
        steam_id: Optional[str] = None,
        app_id: Optional[str] = None,
    ):
        """Get all transactions with filtering and pagination."""
        collection = cls.get_collection()
        
        # Build query filter
        query_filter = {}
        
        if status_filter:
            query_filter["status"] = status_filter
        
        if date_start:
            query_filter["created_at"] = {"$gte": date_start}
        
        if date_end:
            if "created_at" in query_filter:
                query_filter["created_at"]["$lte"] = date_end
            else:
                query_filter["created_at"] = {"$lte": date_end}
        
        if user_id:
            query_filter["user_id"] = user_id
            
        if steam_id:
            query_filter["steam_id"] = steam_id
            
        if app_id:
            query_filter["app_id"] = app_id
        
        # Execute query with pagination
        cursor = collection.find(query_filter).sort("created_at", DESCENDING).skip(skip).limit(limit)
        transactions = await cursor.to_list(length=limit)
        
        return transactions
    
    @classmethod
    async def get_by_id(cls, transaction_id: str):
        """Get transaction by ID."""
        collection = cls.get_collection()
        
        transaction = await collection.find_one({"_id": transaction_id})
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction with ID {transaction_id} not found"
            )
        
        return transaction
    
    @classmethod
    async def get_by_order_id(cls, order_id: str):
        """Get transaction by order ID."""
        collection = cls.get_collection()
        
        transaction = await collection.find_one({"order_id": order_id})
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction with order ID {order_id} not found"
            )
        
        return transaction
    
    @classmethod
    async def create(cls, transaction_data: dict):
        """Create a new transaction record."""
        collection = cls.get_collection()
        
        # Generate ID if not provided
        if "_id" not in transaction_data:
            transaction_data["_id"] = str(ObjectId())
        
        # Add timestamps if not provided
        if "created_at" not in transaction_data:
            transaction_data["created_at"] = datetime.utcnow()
        
        if "updated_at" not in transaction_data:
            transaction_data["updated_at"] = transaction_data["created_at"]
        
        # Make sure type is set
        if "type" not in transaction_data:
            transaction_data["type"] = "unknown"
        
        # Insert transaction
        await collection.insert_one(transaction_data)
        
        return transaction_data
    
    @classmethod
    async def update(cls, transaction_id: str, update_data: dict):
        """Update transaction."""
        collection = cls.get_collection()
        
        # Get existing transaction before update
        existing_transaction = await cls.get_by_id(transaction_id)
        old_status = existing_transaction.get("status")
        
        # Update timestamp
        update_data["updated_at"] = datetime.utcnow()
        
        # Update transaction
        result = await collection.update_one(
            {"_id": transaction_id}, {"$set": update_data}
        )
        
        if result.modified_count == 0:
            # Check if document exists
            existing = await collection.find_one({"_id": transaction_id})
            if not existing:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Transaction with ID {transaction_id} not found"
                )
        
        # Get updated transaction
        updated_transaction = await cls.get_by_id(transaction_id)
        
        # Send notification if status has changed
        new_status = updated_transaction.get("status")
        if old_status != new_status:
            try:
                notification_type = None
                recipients = []
                
                if new_status == "completed":
                    notification_type = NotificationType.TRANSACTION_COMPLETED
                    # Add customer email if available
                elif new_status == "failed":
                    notification_type = NotificationType.TRANSACTION_FAILED
                    # Add admin emails for monitoring
                
                # Send notification if type is determined and we have recipients
                if notification_type:
                    # This will do nothing if no providers are configured or enabled
                    await NotificationManager.notify(
                        notification_type=notification_type,
                        data=updated_transaction,
                        recipients=recipients
                    )
            except Exception as e:
                # Log but don't fail the update if notification fails
                logger.error(f"Error sending transaction status notification: {str(e)}")
                
        return updated_transaction
    
    @classmethod
    async def get_stats(cls, days: int = 30, app_id: Optional[str] = None):
        """Get transaction statistics for dashboard."""
        collection = cls.get_collection()
        
        try:
            # Validate days parameter
            days = max(1, min(days, 365))  # Constrain between 1 and 365
            
            # Calculate date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Build base filter
            match_filter = {
                "created_at": {"$gte": start_date, "$lte": end_date}
            }
            
            # Add app_id filter if provided
            if app_id:
                match_filter["app_id"] = app_id
            
            # Use a more efficient aggregation pipeline to get all stats at once
            pipeline = [
                {"$match": match_filter},
                {"$facet": {
                    "total": [
                        {"$count": "count"}
                    ],
                    "statusCounts": [
                        {"$group": {
                            "_id": "$status",
                            "count": {"$sum": 1}
                        }}
                    ],
                    "revenue": [
                        {"$match": {"status": "completed"}},
                        {"$group": {
                            "_id": None,
                            "total": {"$sum": {"$ifNull": ["$amount", 0]}}
                        }}
                    ]
                }}
            ]
            
            result = await collection.aggregate(pipeline).to_list(length=1)
            
            # Extract results from aggregation
            total_result = result[0]["total"][0]["count"] if result[0]["total"] else 0
            
            # Process status counts
            completed_count = 0
            failed_count = 0
            pending_count = 0
            
            for status_group in result[0]["statusCounts"]:
                status = status_group["_id"]
                count = status_group["count"]
                
                if status == "completed":
                    completed_count = count
                elif status == "failed":
                    failed_count = count
                elif status == "pending":
                    pending_count = count
            
            # Get total revenue
            revenue_results = result[0]["revenue"]
            total_revenue = revenue_results[0]["total"] if revenue_results else 0.0
            
            # Return statistics
            return {
                "total_count": total_result,
                "completed_count": completed_count,
                "failed_count": failed_count,
                "pending_count": pending_count,
                "total_revenue": float(total_revenue),  # Ensure consistent type
                "currency": "USD",  # Default currency
                "period_days": days,
            }
        except Exception as e:
            # Log error and return empty stats
            logger.error(f"Error getting transaction stats: {str(e)}")
            return {
                "total_count": 0,
                "completed_count": 0,
                "failed_count": 0,
                "pending_count": 0,
                "total_revenue": 0.0,
                "currency": "USD",
                "period_days": days,
            }
    
    @classmethod
    async def get_revenue_data(cls, days: int = 30, app_id: Optional[str] = None):
        """Get revenue data for chart display."""
        collection = cls.get_collection()
        
        try:
            # Validate days parameter
            days = max(1, min(days, 365))  # Constrain between 1 and 365
            
            # Calculate date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Build base filter
            match_filter = {
                "created_at": {"$gte": start_date, "$lte": end_date},
                "status": "completed"
            }
            
            if app_id:
                match_filter["app_id"] = app_id
            
            # Aggregate revenue by day
            pipeline = [
                {"$match": match_filter},
                {"$project": {
                    "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                    "amount": {"$ifNull": ["$amount", 0]}
                }},
                {"$group": {
                    "_id": "$date",
                    "revenue": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}}
            ]
            
            result = await collection.aggregate(pipeline).to_list(length=days)
            
            # Create efficient lookup for dates
            date_map = {item["_id"]: item for item in result}
            
            # Generate all dates in range and build data set
            chart_data = []
            current = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date_day = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            while current <= end_date_day:
                date_str = current.strftime("%Y-%m-%d")
                if date_str in date_map:
                    chart_data.append({
                        "date": date_str,
                        "revenue": float(date_map[date_str]["revenue"]),  # Ensure consistent type
                        "count": date_map[date_str]["count"]
                    })
                else:
                    chart_data.append({
                        "date": date_str,
                        "revenue": 0.0,
                        "count": 0
                    })
                # Move to next day
                current += timedelta(days=1)
            
            return chart_data
            
        except Exception as e:
            # Log error and return empty data
            logger.error(f"Error getting revenue chart data: {str(e)}")
            # Return empty dataset with current date
            return [{
                "date": datetime.utcnow().strftime("%Y-%m-%d"),
                "revenue": 0.0,
                "count": 0
            }]
    
    @classmethod
    async def get_top_products(cls, limit: int = 5, days: int = 30, app_id: Optional[str] = None):
        """Get top selling products for dashboard."""
        collection = cls.get_collection()
        
        try:
            # Validate parameters
            limit = max(1, min(limit, 50))  # Constrain between 1 and 50
            days = max(1, min(days, 365))   # Constrain between 1 and 365
            
            # Calculate date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Build base filter
            match_filter = {
                "created_at": {"$gte": start_date, "$lte": end_date},
                "status": "completed",
            }
            
            # Add non-empty product filters
            match_filter["$or"] = [
                {"product_id": {"$exists": True, "$ne": None}},
                {"product_name": {"$exists": True, "$ne": None}}
            ]
            
            if app_id:
                match_filter["app_id"] = app_id
            
            # Aggregate by product
            pipeline = [
                {"$match": match_filter},
                # Use coalesce to handle missing product data
                {"$project": {
                    "product_id": {"$ifNull": ["$product_id", "unknown"]},
                    "product_name": {"$ifNull": ["$product_name", "$item_description"]},
                    "amount": {"$ifNull": ["$amount", 0]}
                }},
                {"$group": {
                    "_id": "$product_id",
                    "product_name": {"$first": {"$ifNull": ["$product_name", "Unknown Product"]}},
                    "revenue": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }},
                {"$match": {
                    "revenue": {"$gt": 0}  # Filter out products with zero revenue
                }},
                {"$sort": {"revenue": DESCENDING}},
                {"$limit": limit}
            ]
            
            result = await collection.aggregate(pipeline).to_list(length=limit)
            
            # Format results and ensure consistent types
            formatted_results = []
            for item in result:
                formatted_results.append({
                    "id": item["_id"],
                    "product_name": item["product_name"] or "Unknown Product",
                    "revenue": float(item["revenue"]),
                    "count": item["count"]
                })
            
            return formatted_results
        except Exception as e:
            # Log error and return empty list
            logger.error(f"Error getting top products: {str(e)}")
            return []
    
    @classmethod
    async def get_recent_transactions(cls, limit: int = 5, app_id: Optional[str] = None):
        """Get recent transactions for dashboard."""
        collection = cls.get_collection()
        
        try:
            # Validate limit
            limit = max(1, min(limit, 50))  # Constrain between 1 and 50
            
            # Build filter
            query_filter = {}
            if app_id:
                query_filter["app_id"] = app_id
            
            # Query with projection to limit fields
            projection = {
                "_id": 1,
                "type": 1,
                "order_id": 1,
                "trans_id": 1,
                "steam_id": 1,
                "product_id": 1,
                "product_name": 1,
                "item_description": 1,
                "amount": 1,
                "currency": 1,
                "status": 1,
                "created_at": 1,
                "app_id": 1
            }
            
            # Query with efficient cursor
            cursor = collection.find(
                query_filter, 
                projection
            ).sort("created_at", DESCENDING).limit(limit)
            
            transactions = await cursor.to_list(length=limit)
            
            # Add default product name if missing
            for tx in transactions:
                if "product_name" not in tx or not tx["product_name"]:
                    tx["product_name"] = tx.get("item_description", "Unknown Product")
            
            return transactions
        except Exception as e:
            # Log error and return empty list
            logger.error(f"Error getting recent transactions: {str(e)}")
            return []