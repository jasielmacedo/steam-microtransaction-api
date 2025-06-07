import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from fastapi import HTTPException, status

from app.db.mongodb import get_database

logger = logging.getLogger(__name__)

class Game:
    """Game model for managing Steam apps."""
    
    # Collection name in MongoDB
    collection_name = "games"
    
    @classmethod
    def get_collection(cls):
        """Get game collection."""
        return get_database()[cls.collection_name]
    
    @classmethod
    async def get_all(cls, skip: int = 0, limit: int = 100, active_only: bool = False):
        """Get all games with pagination."""
        try:
            collection = cls.get_collection()
            
            # Query filter
            query_filter = {}
            if active_only:
                query_filter["active"] = True
            
            cursor = collection.find(query_filter).sort("name", 1).skip(skip).limit(limit)
            games = await cursor.to_list(length=limit)
            
            return games
        except Exception as e:
            logger.error(f"Error retrieving games: {str(e)}")
            return []
    
    @classmethod
    async def get_many(cls, skip: int = 0, limit: int = 10, search: Optional[str] = None, 
                      team_id: Optional[str] = None, active_only: bool = False):
        """Get games with pagination and search capabilities."""
        try:
            collection = cls.get_collection()
            
            # Query filter
            query_filter = {}
            
            if active_only:
                query_filter["active"] = True
                
            if team_id:
                query_filter["team_id"] = team_id
                
            if search:
                query_filter["$or"] = [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"description": {"$regex": search, "$options": "i"}},
                    {"steam_app_id": {"$regex": search, "$options": "i"}}
                ]
            
            # Get total count
            total = await collection.count_documents(query_filter)
            
            # Get games with pagination
            cursor = collection.find(query_filter).sort("created_at", -1).skip(skip).limit(limit)
            games = await cursor.to_list(length=limit)
            
            return games, total
        except Exception as e:
            logger.error(f"Error retrieving games with search: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving games: {str(e)}"
            )
    
    @classmethod
    async def get_by_id(cls, game_id: str):
        """Get game by ID."""
        try:
            collection = cls.get_collection()
            
            game = await collection.find_one({"_id": game_id})
            if not game:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Game with ID {game_id} not found"
                )
            
            return game
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error retrieving game {game_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving game: {str(e)}"
            )
    
    @classmethod
    async def get_by_steam_app_id(cls, steam_app_id: str):
        """Get game by Steam App ID."""
        try:
            collection = cls.get_collection()
            
            game = await collection.find_one({"steam_app_id": steam_app_id})
            if not game:
                return None
            
            return game
        except Exception as e:
            logger.error(f"Error retrieving game by Steam App ID {steam_app_id}: {str(e)}")
            return None
    
    @classmethod
    async def create(cls, game_data: dict):
        """Create a new game."""
        try:
            collection = cls.get_collection()
            
            # Check if steam_app_id already exists
            if "steam_app_id" in game_data and game_data["steam_app_id"]:
                existing_game = await cls.get_by_steam_app_id(game_data["steam_app_id"])
                if existing_game:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Game with Steam App ID {game_data['steam_app_id']} already exists"
                    )
            
            # Generate a new ID if not provided
            if "_id" not in game_data:
                game_data["_id"] = str(ObjectId())
            
            # Add timestamps
            game_data["created_at"] = datetime.utcnow()
            game_data["updated_at"] = game_data["created_at"]
            
            # Set defaults
            if "active" not in game_data:
                game_data["active"] = True
            
            # Insert game
            await collection.insert_one(game_data)
            
            return game_data
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating game: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating game: {str(e)}"
            )
    
    @classmethod
    async def update(cls, game_id: str, update_data: dict):
        """Update game."""
        try:
            collection = cls.get_collection()
            
            # Check if steam_app_id already exists on another game
            if "steam_app_id" in update_data and update_data["steam_app_id"]:
                existing_game = await cls.get_by_steam_app_id(update_data["steam_app_id"])
                if existing_game and existing_game["_id"] != game_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Game with Steam App ID {update_data['steam_app_id']} already exists"
                    )
            
            # Get existing game
            existing_game = await cls.get_by_id(game_id)
            
            # Add updated timestamp
            update_data["updated_at"] = datetime.utcnow()
            
            # Update game
            result = await collection.update_one(
                {"_id": game_id}, {"$set": update_data}
            )
            
            if result.modified_count == 0 and result.matched_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Game with ID {game_id} not found"
                )
            
            # Get updated game
            updated_game = await cls.get_by_id(game_id)
            return updated_game
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating game {game_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating game: {str(e)}"
            )
    
    @classmethod
    async def delete(cls, game_id: str):
        """Delete game."""
        try:
            collection = cls.get_collection()
            
            # Check if there are products associated with this game
            product_collection = get_database()["products"]
            products_count = await product_collection.count_documents({"game_id": game_id})
            if products_count > 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot delete game with {products_count} associated products"
                )
            
            # Delete game
            result = await collection.delete_one({"_id": game_id})
            
            if result.deleted_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Game with ID {game_id} not found"
                )
            
            return True
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting game {game_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting game: {str(e)}"
            )