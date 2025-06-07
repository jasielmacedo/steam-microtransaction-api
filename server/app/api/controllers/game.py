from typing import Dict, List, Any, Optional
from fastapi import Depends, Query, Path, HTTPException, status
from bson.objectid import ObjectId

from app.api.models.game import Game
from app.api.schemas.game import GameCreate, GameUpdate, GameResponse, GamesResponse
from app.core.security import get_current_user
from app.core.exceptions import NotFoundException, ForbiddenException

async def create_game(
    game_data: GameCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Create a new game.
    """
    # Check for admin role
    if current_user.get("role") != "admin":
        raise ForbiddenException("Only admins can create games")
    
    # Check if a game with the same Steam App ID already exists
    existing_game = await Game.get_by_steam_app_id(game_data.steam_app_id)
    if existing_game:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Game with Steam App ID {game_data.steam_app_id} already exists"
        )
    
    # Create new game
    game_dict = game_data.model_dump()
    game_dict["created_by"] = current_user.get("_id")
    game_dict["team_id"] = current_user.get("team_id")
    
    result = await Game.create(game_dict)
    return result

async def get_games(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get a list of games.
    """
    # Only admins can see all games, others see only their team's games
    team_id = current_user.get("team_id")
    
    # Get games
    games, total = await Game.get_many(
        skip=skip,
        limit=limit,
        search=search,
        team_id=team_id
    )
    
    return {
        "items": games,
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit
    }

async def get_game(
    game_id: str = Path(..., title="The ID of the game to get"),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get a game by ID.
    """
    # Validate ObjectId
    try:
        ObjectId(game_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid game ID format"
        )
    
    # Get game
    game = await Game.get_by_id(game_id)
    if not game:
        raise NotFoundException(f"Game with ID {game_id} not found")
    
    # Check if user can access this game (admin or same team)
    if current_user.get("role") != "admin" and game.get("team_id") != current_user.get("team_id"):
        raise ForbiddenException("You don't have permission to access this game")
    
    return game

async def update_game(
    game_id: str = Path(..., title="The ID of the game to update"),
    game_data: GameUpdate = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Update a game.
    """
    # Check for admin role
    if current_user.get("role") != "admin":
        raise ForbiddenException("Only admins can update games")
    
    # Validate ObjectId
    try:
        ObjectId(game_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid game ID format"
        )
    
    # Get game
    game = await Game.get_by_id(game_id)
    if not game:
        raise NotFoundException(f"Game with ID {game_id} not found")
    
    # If steam_app_id is changed, check if it already exists
    if game_data.steam_app_id and game_data.steam_app_id != game.get("steam_app_id"):
        existing_game = await Game.get_by_steam_app_id(game_data.steam_app_id)
        if existing_game and existing_game.get("_id") != game_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Game with Steam App ID {game_data.steam_app_id} already exists"
            )
    
    # Update game
    update_data = {k: v for k, v in game_data.model_dump(exclude_unset=True).items()}
    updated_game = await Game.update(game_id, update_data)
    if not updated_game:
        raise NotFoundException(f"Game with ID {game_id} not found")
    
    return updated_game

async def delete_game(
    game_id: str = Path(..., title="The ID of the game to delete"),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, str]:
    """
    Delete a game.
    """
    # Check for admin role
    if current_user.get("role") != "admin":
        raise ForbiddenException("Only admins can delete games")
    
    # Validate ObjectId
    try:
        ObjectId(game_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid game ID format"
        )
    
    # Get game to verify it exists
    game = await Game.get_by_id(game_id)
    if not game:
        raise NotFoundException(f"Game with ID {game_id} not found")
    
    # TODO: Check if game has related products before deleting
    # Consider implementing soft delete or relations check
    
    # Delete game
    result = await Game.delete(game_id)
    if result:
        return {"message": "Game deleted successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete game"
        )