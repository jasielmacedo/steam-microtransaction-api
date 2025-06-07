import logging
from datetime import datetime
from typing import Dict, Any, Optional, List

import httpx
from bson import ObjectId
from fastapi import HTTPException

from app.core.config import settings
from app.core.exceptions import SteamAPIException
from app.db.mongodb import get_database
from app.api.models.transaction import Transaction
from app.utils.notifications import NotificationManager, NotificationType

logger = logging.getLogger(__name__)


class SteamAPI:
    """Steam API client."""
    
    # Base URLs
    STEAM_API_URL = "https://api.steampowered.com"
    STEAM_STORE_API_URL = "https://store.steampowered.com/api"
    
    # Collection name in MongoDB
    transactions_collection = "transactions"
    
    @classmethod
    async def _record_transaction(cls, transaction_data: dict) -> Dict[str, Any]:
        """Record transaction with enhanced analytics data."""
        # Generate new ID if not provided
        if "_id" not in transaction_data:
            transaction_data["_id"] = str(ObjectId())
            
        # Set status if not provided
        if "status" not in transaction_data:
            transaction_data["status"] = "pending"
            
        # Set timestamps
        transaction_data["created_at"] = datetime.utcnow()
        transaction_data["updated_at"] = transaction_data["created_at"]
        
        # Use Transaction model to create record with analytics support
        transaction = await Transaction.create(transaction_data)
        
        # Send notification based on transaction type and status
        try:
            # Determine notification type based on transaction type and status
            notification_type = None
            recipients = []
            
            if transaction_data["type"] == "init_purchase":
                notification_type = NotificationType.TRANSACTION_CREATED
                # Add any team emails or admin emails as recipients
                # In a real implementation, you would get these from settings or user records
            
            elif transaction_data["type"] == "finalize_purchase" and transaction_data["status"] == "completed":
                notification_type = NotificationType.TRANSACTION_COMPLETED
                # Add customer email if available
                
            elif transaction_data["status"] == "failed":
                notification_type = NotificationType.TRANSACTION_FAILED
                # Add admin emails for monitoring
            
            # Send notification if type is determined and there are recipients
            if notification_type:
                # This will do nothing if no providers are configured or enabled
                await NotificationManager.notify(
                    notification_type=notification_type,
                    data=transaction,
                    recipients=recipients
                )
        except Exception as e:
            # Log but don't fail the transaction if notification fails
            logger.error(f"Error sending transaction notification: {str(e)}")
            
        return transaction
    
    @classmethod
    async def get_reliable_user_info(cls, steam_id: str, app_id: Optional[str] = None) -> Dict[str, Any]:
        """Get reliable user info from Steam API."""
        try:
            # Prepare request data
            request_data = {
                "key": settings.STEAM_PUBLISHER_KEY,
                "steamid": steam_id,
            }
            
            # Add app_id if provided
            if app_id:
                request_data["appid"] = app_id
                
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{cls.STEAM_API_URL}/IMicroTxn/GetUserInfo/v0001/",
                    data=request_data,
                    timeout=10.0,
                )
                
                if response.status_code != 200:
                    logger.error(f"Steam API error: {response.text}")
                    raise SteamAPIException("Failed to get reliable user info from Steam")
                
                data = response.json()
                
                # Record transaction in database with analytics support
                transaction_data = {
                    "type": "get_reliable_user_info",
                    "steam_id": steam_id,
                    "success": True,
                    "status": "completed",
                    "response": data,
                }
                
                # Add app_id if provided
                if app_id:
                    transaction_data["app_id"] = app_id
                    
                await cls._record_transaction(transaction_data)
                
                return {"success": True}
        except httpx.RequestError as e:
            logger.error(f"Steam API request error: {str(e)}")
            raise SteamAPIException(f"Steam API request error: {str(e)}")
    
    @classmethod
    async def check_app_ownership(cls, steam_id: str, app_id: str) -> Dict[str, Any]:
        """Check if user owns the app."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{cls.STEAM_API_URL}/ISteamUser/CheckAppOwnership/v0001/",
                    params={
                        "key": settings.STEAM_API_KEY,
                        "steamid": steam_id,
                        "appid": app_id,
                    },
                    timeout=10.0,
                )
                
                if response.status_code != 200:
                    logger.error(f"Steam API error: {response.text}")
                    raise SteamAPIException("Failed to check app ownership from Steam")
                
                data = response.json()
                
                # Record transaction in database with analytics support
                await cls._record_transaction({
                    "type": "check_app_ownership",
                    "steam_id": steam_id,
                    "app_id": app_id,
                    "success": True,
                    "status": "completed",
                    "response": data,
                })
                
                return {"success": data.get("ownsapp", False)}
        except httpx.RequestError as e:
            logger.error(f"Steam API request error: {str(e)}")
            raise SteamAPIException(f"Steam API request error: {str(e)}")
    
    @classmethod
    async def init_purchase(
        cls,
        app_id: str,
        order_id: str,
        item_id: int,
        item_description: str,
        category: str,
        steam_id: str,
        product_id: Optional[str] = None,
        product_name: Optional[str] = None,
        amount: Optional[float] = None,
        currency: str = "USD",
        quantity: int = 1,
    ) -> Dict[str, Any]:
        """Initialize purchase transaction."""
        try:
            # Ensure quantity is at least 1
            quantity = max(1, quantity)
            
            # Calculate total amount based on quantity
            total_amount = int((amount * quantity * 100) if amount else 100)
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{cls.STEAM_API_URL}/IMicroTxn/InitTxn/v0003/",
                    data={
                        "key": settings.STEAM_PUBLISHER_KEY,
                        "orderid": order_id,
                        "steamid": steam_id,
                        "appid": app_id,
                        "itemcount": 1,
                        "language": "en",
                        "currency": currency,
                        "itemid[0]": item_id,
                        "qty[0]": quantity,
                        "amount[0]": total_amount,  # Total amount in cents
                        "description[0]": item_description,
                        "category[0]": category,
                    },
                    timeout=10.0,
                )
                
                if response.status_code != 200:
                    logger.error(f"Steam API error: {response.text}")
                    raise SteamAPIException("Failed to initialize purchase transaction")
                
                data = response.json()
                
                # Determine transaction status based on response
                status = "pending"
                success = data.get("response", {}).get("result") == "OK"
                
                if not success:
                    status = "failed"
                
                # Get transaction ID from response
                trans_id = data.get("response", {}).get("transid", "")
                
                # Record transaction in database with analytics support
                await cls._record_transaction({
                    "type": "init_purchase",
                    "app_id": app_id,
                    "order_id": order_id,
                    "trans_id": trans_id,
                    "item_id": item_id,
                    "item_description": item_description,
                    "category": category,
                    "steam_id": steam_id,
                    "product_id": product_id,
                    "product_name": product_name or item_description,
                    "amount": amount,
                    "quantity": quantity,
                    "total_amount": amount * quantity if amount else None,
                    "currency": currency,
                    "success": success,
                    "status": status,
                    "response": data,
                })
                
                if data.get("response", {}).get("result") == "OK":
                    return {"transid": data.get("response", {}).get("transid", "")}
                else:
                    error = data.get("response", {}).get("error", "Unknown error")
                    raise SteamAPIException(f"Steam API error: {error}")
        except httpx.RequestError as e:
            logger.error(f"Steam API request error: {str(e)}")
            raise SteamAPIException(f"Steam API request error: {str(e)}")
    
    @classmethod
    async def finalize_purchase(cls, app_id: str, order_id: str) -> Dict[str, Any]:
        """Finalize purchase transaction."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{cls.STEAM_API_URL}/IMicroTxn/FinalizeTxn/v0002/",
                    data={
                        "key": settings.STEAM_PUBLISHER_KEY,
                        "orderid": order_id,
                        "appid": app_id,
                    },
                    timeout=10.0,
                )
                
                if response.status_code != 200:
                    logger.error(f"Steam API error: {response.text}")
                    raise SteamAPIException("Failed to finalize purchase transaction")
                
                data = response.json()
                
                # Determine transaction status based on response
                success = data.get("response", {}).get("result") == "OK"
                status = "completed" if success else "failed"
                
                # Record transaction in database with analytics support
                await cls._record_transaction({
                    "type": "finalize_purchase",
                    "app_id": app_id,
                    "order_id": order_id,
                    "success": success,
                    "status": status,
                    "response": data,
                })
                
                # If successful, update the original init_purchase transaction to completed
                if success:
                    try:
                        # Find the init_purchase transaction
                        collection = get_database()[cls.transactions_collection]
                        init_transaction = await collection.find_one({
                            "type": "init_purchase",
                            "order_id": order_id,
                            "app_id": app_id
                        })
                        
                        if init_transaction and "_id" in init_transaction:
                            # Update its status
                            await Transaction.update(
                                init_transaction["_id"],
                                {"status": "completed", "updated_at": datetime.utcnow()}
                            )
                    except Exception as e:
                        logger.error(f"Error updating init transaction: {str(e)}")
                
                if data.get("response", {}).get("result") == "OK":
                    return {"success": True}
                else:
                    error = data.get("response", {}).get("error", "Unknown error")
                    raise SteamAPIException(f"Steam API error: {error}")
        except httpx.RequestError as e:
            logger.error(f"Steam API request error: {str(e)}")
            raise SteamAPIException(f"Steam API request error: {str(e)}")
    
    @classmethod
    async def check_purchase_status(cls, app_id: str, order_id: str, trans_id: str) -> Dict[str, Any]:
        """Check purchase transaction status."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{cls.STEAM_API_URL}/IMicroTxn/QueryTxn/v0002/",
                    data={
                        "key": settings.STEAM_PUBLISHER_KEY,
                        "orderid": order_id,
                        "appid": app_id,
                        "transid": trans_id,
                    },
                    timeout=10.0,
                )
                
                if response.status_code != 200:
                    logger.error(f"Steam API error: {response.text}")
                    raise SteamAPIException("Failed to check purchase status")
                
                data = response.json()
                
                # Get status from response
                success = data.get("response", {}).get("result") == "OK"
                steam_status = data.get("response", {}).get("params", {}).get("status", "")
                
                # Map Steam status to our status format
                status = "pending"
                if steam_status.lower() in ["complete", "completed"]:
                    status = "completed"
                elif steam_status.lower() in ["failed", "cancelled", "denied"]:
                    status = "failed"
                
                # Get items from response
                items = data.get("response", {}).get("items", [])
                
                # Calculate total amount from items if available
                amount = None
                if items:
                    try:
                        amount = sum([float(item.get("amount", 0)) / 100 for item in items])
                    except (ValueError, TypeError):
                        pass
                
                # Get currency from response
                currency = data.get("response", {}).get("params", {}).get("currency", "USD")
                
                # Record transaction in database with analytics support
                transaction_data = {
                    "type": "check_purchase_status",
                    "app_id": app_id,
                    "order_id": order_id,
                    "trans_id": trans_id,
                    "steam_id": data.get("response", {}).get("params", {}).get("steamid", ""),
                    "success": success,
                    "status": status,
                    "currency": currency,
                    "response": data,
                }
                
                # Add amount if calculated
                if amount is not None:
                    transaction_data["amount"] = amount
                
                await cls._record_transaction(transaction_data)
                
                # Update the init_purchase transaction if this check shows it's completed
                if status == "completed":
                    try:
                        # Find the init_purchase transaction
                        collection = get_database()[cls.transactions_collection]
                        init_transaction = await collection.find_one({
                            "type": "init_purchase",
                            "order_id": order_id,
                            "app_id": app_id
                        })
                        
                        if init_transaction and "_id" in init_transaction:
                            # Update its status
                            await Transaction.update(
                                init_transaction["_id"],
                                {"status": "completed", "updated_at": datetime.utcnow()}
                            )
                    except Exception as e:
                        logger.error(f"Error updating init transaction: {str(e)}")
                
                if data.get("response", {}).get("result") == "OK":
                    return {
                        "success": True,
                        "orderid": data.get("response", {}).get("params", {}).get("orderid", ""),
                        "transid": data.get("response", {}).get("params", {}).get("transid", ""),
                        "steamid": data.get("response", {}).get("params", {}).get("steamid", ""),
                        "status": data.get("response", {}).get("params", {}).get("status", ""),
                        "currency": data.get("response", {}).get("params", {}).get("currency", ""),
                        "time": data.get("response", {}).get("params", {}).get("time", ""),
                        "country": data.get("response", {}).get("params", {}).get("country", ""),
                        "usstate": data.get("response", {}).get("params", {}).get("usstate", ""),
                        "items": data.get("response", {}).get("items", []),
                    }
                else:
                    error = data.get("response", {}).get("error", "Unknown error")
                    raise SteamAPIException(f"Steam API error: {error}")
        except httpx.RequestError as e:
            logger.error(f"Steam API request error: {str(e)}")
            raise SteamAPIException(f"Steam API request error: {str(e)}")