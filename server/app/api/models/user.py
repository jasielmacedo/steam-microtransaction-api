import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorCollection
from passlib.context import CryptContext
from pymongo.errors import DuplicateKeyError

from app.core.exceptions import ConflictException, NotFoundException
from app.db.mongodb import get_database

# Password handling
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"


class User:
    """User model for database operations."""
    
    # Collection name in MongoDB
    collection_name = "users"
    
    @classmethod
    def get_collection(cls) -> AsyncIOMotorCollection:
        """Get user collection."""
        return get_database()[cls.collection_name]
    
    @classmethod
    async def get_by_id(cls, user_id: str):
        """Get user by ID."""
        collection = cls.get_collection()
        user = await collection.find_one({"_id": user_id})
        if not user:
            raise NotFoundException(f"User with ID {user_id} not found")
        return user
    
    @classmethod
    async def get_by_email(cls, email: str):
        """Get user by email."""
        collection = cls.get_collection()
        user = await collection.find_one({"email": email.lower()})
        return user  # Returns None if no user found
    
    @classmethod
    async def get_by_api_key(cls, api_key: str):
        """Get user by API key."""
        collection = cls.get_collection()
        user = await collection.find_one({"api_key": api_key})
        return user
    
    @classmethod
    async def create(cls, user_data: dict):
        """Create a new user."""
        collection = cls.get_collection()
        
        # Check if user with this email already exists
        existing_user = await cls.get_by_email(user_data["email"])
        if existing_user:
            raise ConflictException("User with this email already exists")
        
        # Prepare user data
        user_id = str(uuid.uuid4())
        created_at = datetime.utcnow()
        
        # Hash password
        hashed_password = pwd_context.hash(user_data["password"])
        
        # Create user document
        user = {
            "_id": user_id,
            "email": user_data["email"].lower(),
            "name": user_data["name"],
            "password": hashed_password,
            "role": user_data.get("role", UserRole.USER),
            "steam_id": user_data.get("steam_id"),
            "api_key": user_data.get("api_key"),
            "created_at": created_at,
            "updated_at": created_at,
        }
        
        try:
            await collection.insert_one(user)
            # Don't return the password
            user.pop("password", None)
            return user
        except DuplicateKeyError:
            raise ConflictException("User with this email already exists")
    
    @classmethod
    async def update(cls, user_id: str, update_data: dict):
        """Update user."""
        collection = cls.get_collection()
        
        # Get existing user
        existing_user = await cls.get_by_id(user_id)
        
        # Prepare update data
        update_data["updated_at"] = datetime.utcnow()
        
        # Hash password if provided
        if "password" in update_data:
            update_data["password"] = pwd_context.hash(update_data["password"])
        
        try:
            # Update user
            result = await collection.update_one(
                {"_id": user_id}, {"$set": update_data}
            )
            if result.modified_count == 0:
                raise NotFoundException(f"User with ID {user_id} not found")
            
            # Get updated user
            updated_user = await cls.get_by_id(user_id)
            # Don't return the password
            updated_user.pop("password", None)
            return updated_user
        except DuplicateKeyError:
            raise ConflictException("Email is already in use")
    
    @classmethod
    async def delete(cls, user_id: str):
        """Delete user."""
        collection = cls.get_collection()
        
        # Delete user
        result = await collection.delete_one({"_id": user_id})
        if result.deleted_count == 0:
            raise NotFoundException(f"User with ID {user_id} not found")
        return True
    
    @classmethod
    async def get_all(cls, skip: int = 0, limit: int = 100):
        """Get all users with pagination."""
        collection = cls.get_collection()
        
        cursor = collection.find({}).skip(skip).limit(limit)
        users = await cursor.to_list(length=limit)
        
        # Remove passwords
        for user in users:
            user.pop("password", None)
        
        return users
    
    @classmethod
    async def verify_password(cls, plain_password: str, hashed_password: str) -> bool:
        """Verify password."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @classmethod
    async def authenticate(cls, email: str, password: str):
        """Authenticate user."""
        user = await cls.get_by_email(email)
        
        if not user:
            return False
        
        if not await cls.verify_password(password, user["password"]):
            return False
        
        # Don't return the password
        user.pop("password", None)
        return user
    
    @classmethod
    async def generate_api_key(cls, user_id: str) -> str:
        """Generate API key for user."""
        import secrets
        import string
        
        # Generate a random API key
        alphabet = string.ascii_letters + string.digits
        api_key = "".join(secrets.choice(alphabet) for _ in range(40))
        
        # Update user with API key
        await cls.update(user_id, {"api_key": api_key})
        
        return api_key