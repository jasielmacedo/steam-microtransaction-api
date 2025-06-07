from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from fastapi import HTTPException, status
import logging

from app.db.mongodb import get_database
from app.api.models.game import Game

logger = logging.getLogger(__name__)

class Product:
    """Product model for database operations."""
    
    # Collection name in MongoDB
    collection_name = "products"
    
    @classmethod
    def get_collection(cls):
        """Get product collection."""
        return get_database()[cls.collection_name]
    
    @classmethod
    async def get_all(cls, skip: int = 0, limit: int = 100, active_only: bool = False, 
                     steam_app_id: Optional[str] = None, game_id: Optional[str] = None, 
                     search: Optional[str] = None, team_id: Optional[str] = None):
        """Get all products with pagination and optional filtering."""
        collection = cls.get_collection()
        games_collection = get_database()["games"]
        
        # Query filter
        query_filter = {}
        if active_only:
            query_filter["active"] = True
            
        if steam_app_id:
            query_filter["steam_app_id"] = steam_app_id
            
        if game_id:
            query_filter["game_id"] = game_id
            
        if search:
            query_filter["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
            
        if team_id:
            query_filter["team_id"] = team_id
        
        try:
            # Get total count
            total = await collection.count_documents(query_filter)
            
            # Get products
            cursor = collection.find(query_filter).sort("created_at", -1).skip(skip).limit(limit)
            products = await cursor.to_list(length=limit)
            
            # Add game names to products
            for product in products:
                if "game_id" in product and product["game_id"]:
                    game = await games_collection.find_one({"_id": product["game_id"]})
                    if game:
                        product["game_name"] = game.get("name", "Unknown Game")
            
            return products, total
        except Exception as e:
            logger.error(f"Error getting products: {str(e)}")
            return [], 0
    
    @classmethod
    async def get_by_id(cls, product_id: str):
        """Get product by ID."""
        collection = cls.get_collection()
        games_collection = get_database()["games"]
        
        product = await collection.find_one({"_id": product_id})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )
        
        # Add game name if product has a game_id
        if "game_id" in product and product["game_id"]:
            game = await games_collection.find_one({"_id": product["game_id"]})
            if game:
                product["game_name"] = game.get("name", "Unknown Game")
        
        return product
    
    @classmethod
    async def create(cls, product_data: dict):
        """Create a new product."""
        collection = cls.get_collection()
        
        # Generate a new ID if not provided
        if "_id" not in product_data:
            product_data["_id"] = str(ObjectId())
        
        # Add timestamps
        product_data["created_at"] = datetime.utcnow()
        product_data["updated_at"] = product_data["created_at"]
        
        # Handle price conversion for backward compatibility
        # The validator should have already converted price to price_cents, but double-check
        if "price" in product_data and product_data["price"] is not None:
            if "price_cents" not in product_data or product_data["price_cents"] is None:
                product_data["price_cents"] = int(product_data["price"] * 100)
        
        # If game_id is provided, validate it exists and use its steam_app_id
        if "game_id" in product_data and product_data["game_id"]:
            game = await Game.get_by_id(product_data["game_id"])
            if game:
                # Use the game's Steam App ID directly instead of storing it redundantly
                product_data["steam_app_id"] = game.get("steam_app_id")
        elif "steam_app_id" in product_data:
            # If no game_id but steam_app_id is provided, remove it to ensure we always use the game relation
            del product_data["steam_app_id"]
        
        # Generate a Steam Item ID if not provided (for API purposes)
        if "steam_item_id" not in product_data or not product_data["steam_item_id"]:
            # Using the ObjectID as a basis for generating a unique numeric ID
            product_id = str(product_data.get("_id", ObjectId()))
            # Create a deterministic item ID based on product ID
            product_data["steam_item_id"] = int(int(product_id[:8], 16) % 1000000)
        
        # Insert product
        try:
            await collection.insert_one(product_data)
            return product_data
        except Exception as e:
            logger.error(f"Error creating product: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating product: {str(e)}"
            )
    
    @classmethod
    async def update(cls, product_id: str, update_data: dict):
        """Update product."""
        collection = cls.get_collection()
        
        # Get existing product
        existing_product = await cls.get_by_id(product_id)
        
        # Add updated timestamp
        update_data["updated_at"] = datetime.utcnow()
        
        # Handle price conversion for backward compatibility
        # The schema validator should have done this, but let's ensure it here too
        if "price" in update_data and update_data["price"] is not None:
            if "price_cents" not in update_data or update_data["price_cents"] is None:
                update_data["price_cents"] = int(update_data["price"] * 100)
        
        # If game_id is updated, always use its steam_app_id
        if "game_id" in update_data and update_data["game_id"]:
            try:
                game = await Game.get_by_id(update_data["game_id"])
                if game and game.get("steam_app_id"):
                    # Always use the game's Steam App ID
                    update_data["steam_app_id"] = game.get("steam_app_id")
            except Exception as e:
                logger.error(f"Error validating game for product update: {str(e)}")
        elif "game_id" in update_data and not update_data["game_id"]:
            # If game_id is being removed, also remove steam_app_id
            update_data["steam_app_id"] = None
        elif "steam_app_id" in update_data:
            # If trying to directly update steam_app_id without changing game_id, remove it
            # This ensures steam_app_id always comes from the related game
            del update_data["steam_app_id"]
            
        # If steam_item_id is provided in update, remove it - we use auto-generation only
        if "steam_item_id" in update_data:
            # Keep the existing steam_item_id by removing it from update data
            del update_data["steam_item_id"]
        
        try:
            # Update product
            result = await collection.update_one(
                {"_id": product_id}, {"$set": update_data}
            )
            
            if result.modified_count == 0:
                # Document exists but no changes were made
                if await collection.find_one({"_id": product_id}):
                    return existing_product
                # Document doesn't exist
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {product_id} not found"
                )
            
            # Get updated product
            updated_product = await cls.get_by_id(product_id)
            return updated_product
        except Exception as e:
            logger.error(f"Error updating product: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating product: {str(e)}"
            )
    
    @classmethod
    async def delete(cls, product_id: str):
        """Delete product."""
        collection = cls.get_collection()
        
        # Delete product
        result = await collection.delete_one({"_id": product_id})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )
        
        return True