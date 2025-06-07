import uuid
from datetime import datetime
from typing import Dict, Any, Optional

from motor.motor_asyncio import AsyncIOMotorCollection
from pymongo.errors import DuplicateKeyError

from app.core.exceptions import NotFoundException
from app.db.mongodb import get_database

class Settings:
    """Settings model for database operations."""
    
    # Collection name in MongoDB
    collection_name = "settings"
    
    @classmethod
    def get_collection(cls) -> AsyncIOMotorCollection:
        """Get settings collection."""
        return get_database()[cls.collection_name]
    
    @classmethod
    async def get_by_team_id(cls, team_id: str):
        """Get settings by team ID."""
        collection = cls.get_collection()
        settings = await collection.find_one({"team_id": team_id})
        if not settings:
            # Return default settings if none exist
            return cls.get_default_settings(team_id)
        return settings
    
    @classmethod
    def get_default_settings(cls, team_id: str) -> Dict[str, Any]:
        """Get default settings."""
        return {
            "_id": str(uuid.uuid4()),
            "team_id": team_id,
            "company": {
                "name": "MicroTrax Games",
                "email": "support@microtrax.example.com",
                "website": "https://microtrax.example.com",
            },
            "webhooks": {
                "purchaseSuccess": "https://yourgame.example.com/webhook/purchase/success",
                "purchaseFailed": "https://yourgame.example.com/webhook/purchase/failed",
            },
            "notifications": {
                "purchaseConfirmation": True,
                "failedTransactions": True,
                "weeklyReports": True,
                "newProductReleases": False,
            },
            "notificationProviders": {
                "email": {
                    "enabled": False,
                    "smtpHost": "",
                    "smtpPort": 587,
                    "smtpUser": "",
                    "smtpPassword": "",
                    "fromEmail": "noreply@microtrax.example.com",
                    "useTls": True
                },
                "push": {
                    "enabled": False,
                    "fcmApiKey": "",
                    "fcmUrl": "https://fcm.googleapis.com/fcm/send"
                },
                "web": {
                    "enabled": False,
                    "subscribers": [],
                    "vapidPublicKey": "",
                    "vapidPrivateKey": ""
                }
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
    
    @classmethod
    async def create_or_update(cls, team_id: str, settings_data: Dict[str, Any]):
        """Create or update settings."""
        collection = cls.get_collection()
        
        # Check if settings already exist
        existing_settings = await collection.find_one({"team_id": team_id})
        
        current_time = datetime.utcnow()
        
        if existing_settings:
            # Update existing settings
            update_data = {
                "updated_at": current_time
            }
            
            # Update only provided fields
            if "company" in settings_data:
                update_data["company"] = settings_data["company"]
            if "webhooks" in settings_data:
                update_data["webhooks"] = settings_data["webhooks"]
            if "notifications" in settings_data:
                update_data["notifications"] = settings_data["notifications"]
            if "notificationProviders" in settings_data:
                update_data["notificationProviders"] = settings_data["notificationProviders"]
            
            await collection.update_one(
                {"team_id": team_id},
                {"$set": update_data}
            )
            
            # Get updated settings
            updated_settings = await collection.find_one({"team_id": team_id})
            return updated_settings
        else:
            # Create new settings
            settings = cls.get_default_settings(team_id)
            
            # Update with provided data
            if "company" in settings_data:
                settings["company"] = settings_data["company"]
            if "webhooks" in settings_data:
                settings["webhooks"] = settings_data["webhooks"]
            if "notifications" in settings_data:
                settings["notifications"] = settings_data["notifications"]
            if "notificationProviders" in settings_data:
                settings["notificationProviders"] = settings_data["notificationProviders"]
            
            await collection.insert_one(settings)
            return settings