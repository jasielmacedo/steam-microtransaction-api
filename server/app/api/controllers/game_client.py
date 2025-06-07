from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException, Header

from app.api.models.product import Product
from app.api.models.game import Game
from app.api.schemas.product import GameClientProductListResponse
from app.core.security import verify_api_key

router = APIRouter()

@router.get("/products", response_model=GameClientProductListResponse)
async def get_game_products(
    game_id: str = Query(..., description="Game ID to fetch products for"),
    x_api_key: str = Header(..., description="API Key")
):
    """
    Get all available products for a specific game.
    For use by game clients.
    Only returns active products.
    """
    # Verify API key
    await verify_api_key(x_api_key)
    
    try:
        # First verify the game exists
        game = await Game.get_by_id(game_id)
        
        # Get the Steam App ID
        steam_app_id = game.get("steam_app_id")
        if not steam_app_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Game with ID {game_id} does not have a valid Steam App ID"
            )
        
        # Get active products for this game
        products, total = await Product.get_all(
            game_id=game_id,
            active_only=True
        )
        
        # Return response
        return {
            "success": True,
            "count": len(products),
            "game_id": game_id,
            "steam_app_id": steam_app_id,
            "products": products
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving products: {str(e)}"
        )