"""
Routes for exporting data
"""
from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, Optional

from app.api.controllers.export import export_steam_itemdef
from app.core.security import get_current_user

router = APIRouter(
    prefix="/export",
    tags=["export"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/steam/itemdef", summary="Export products as Steam itemdef.json")
async def get_steam_itemdef_export(
    game_id: Optional[str] = Query(None, description="Game ID to filter products"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Export products in Steam's itemdef.json format.
    
    Returns a JSON file that can be uploaded to Steam.
    Admin only.
    """
    return await export_steam_itemdef(game_id, current_user)