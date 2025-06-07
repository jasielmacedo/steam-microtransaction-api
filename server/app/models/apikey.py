from typing import List, Optional
from datetime import datetime
import secrets
import string
from bson import ObjectId
from pydantic import BaseModel, Field

from app.db.mongodb import get_database
from app.core.exceptions import NotFoundException

class ApiKeyModel(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    user_id: str
    name: str
    key: str 
    prefix: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_used: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }

# Database functions for API keys
async def get_api_keys(user_id: str) -> List[dict]:
    """Get all API keys for a user"""
    database = get_database()
    api_keys = await database["api_keys"].find({"user_id": user_id}).to_list(100)
    return api_keys

async def get_api_key(key_id: str) -> dict:
    """Get API key by ID"""
    database = get_database()
    api_key = await database["api_keys"].find_one({"id": key_id})
    if not api_key:
        raise NotFoundException(f"API key with ID {key_id} not found")
    return api_key

async def get_api_key_by_key(key: str) -> dict:
    """Get API key by actual key value"""
    database = get_database()
    api_key = await database["api_keys"].find_one({"key": key})
    return api_key

async def create_api_key(user_id: str, name: str, prefix: str = "pk_") -> dict:
    """Create a new API key for user"""
    database = get_database()
    
    # Generate a random API key
    alphabet = string.ascii_letters + string.digits
    key_suffix = "".join(secrets.choice(alphabet) for _ in range(32))
    key = f"{prefix}{key_suffix}"
    
    # Create API key object
    api_key = ApiKeyModel(
        user_id=user_id,
        name=name,
        key=key,
        prefix=prefix,
        created_at=datetime.utcnow()
    )
    
    # Convert to dict for MongoDB
    api_key_dict = api_key.model_dump()
    
    # Save to database
    await database["api_keys"].insert_one(api_key_dict)
    
    return api_key_dict

async def delete_api_key(key_id: str, user_id: str) -> bool:
    """Delete an API key"""
    database = get_database()
    
    # Check if key exists and belongs to user
    key = await database["api_keys"].find_one({"id": key_id, "user_id": user_id})
    if not key:
        raise NotFoundException(f"API key with ID {key_id} not found")
    
    # Delete key
    result = await database["api_keys"].delete_one({"id": key_id})
    return result.deleted_count > 0

async def rotate_api_key(key_id: str, user_id: str) -> dict:
    """Rotate (regenerate) an API key but keep the same ID and name"""
    database = get_database()
    
    # Check if key exists and belongs to user
    key = await database["api_keys"].find_one({"id": key_id, "user_id": user_id})
    if not key:
        raise NotFoundException(f"API key with ID {key_id} not found")
    
    # Generate a new key value
    alphabet = string.ascii_letters + string.digits
    key_suffix = "".join(secrets.choice(alphabet) for _ in range(32))
    new_key = f"{key['prefix']}{key_suffix}"
    
    # Update the key
    await database["api_keys"].update_one(
        {"id": key_id},
        {"$set": {"key": new_key, "last_used": None}}
    )
    
    # Get the updated key
    updated_key = await get_api_key(key_id)
    return updated_key

async def update_last_used(key_id: str) -> None:
    """Update the last_used timestamp of an API key"""
    database = get_database()
    await database["api_keys"].update_one(
        {"id": key_id},
        {"$set": {"last_used": datetime.utcnow()}}
    )