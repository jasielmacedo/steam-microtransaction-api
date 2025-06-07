"""
Controllers for exporting data in various formats
"""
from typing import Dict, Any, Optional
from fastapi import Depends, Query, HTTPException, status
from fastapi.responses import Response

from app.api.models.product import Product
from app.api.models.game import Game
from app.api.helpers.steam_export import generate_itemdef_json
from app.api.models.user import UserRole
from app.core.security import get_current_user, authorize_user
from app.core.exceptions import ForbiddenException

async def export_steam_itemdef(
    game_id: Optional[str] = Query(None, description="Game ID to filter products"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Export products in Steam's itemdef.json format.
    
    Returns a JSON file that can be uploaded to Steam.
    Admin only.
    """
    # Check if user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can export Steam itemdef")
    
    try:
        # If game_id is provided, get the Steam App ID from the game
        steam_app_id = None
        if game_id:
            game = await Game.get_by_id(game_id)
            steam_app_id = game.get("steam_app_id")
            
            if not steam_app_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Game with ID {game_id} has no Steam App ID"
                )
        
        # Get all products
        products, _ = await Product.get_all(
            active_only=True,  # Only include active products
            steam_app_id=steam_app_id,  # Filter by Steam App ID if provided
            game_id=game_id,  # Also filter by Game ID if provided
        )
        
        # Generate itemdef.json content
        itemdef_json = generate_itemdef_json(products, steam_app_id)
        
        # Generate a filename based on the app ID or game name
        filename = f"itemdef_{steam_app_id if steam_app_id else 'all'}.json"
        
        # Return the response with appropriate headers for file download
        return Response(
            content=itemdef_json,
            media_type="application/json",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error exporting Steam itemdef: {str(e)}"
        )