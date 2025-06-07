from typing import Dict, Any, List
from fastapi import Depends, Query, status, HTTPException

from app.api.models.user import UserRole
from app.core.security import get_current_user
from app.core.exceptions import ForbiddenException, NotFoundException
from app.schemas.apikey import (
    ApiKeyCreate,
    ApiKeyResponse,
    ApiKeyFullResponse,
    ApiKeyListResponse,
    ApiKeyDetailResponse,
    ApiKeyCreateResponse,
    ApiKeyRotateResponse,
    ApiKeyDeleteResponse,
)
from app.models.apikey import (
    get_api_keys,
    get_api_key,
    create_api_key,
    delete_api_key,
    rotate_api_key,
)

async def list_api_keys(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    List all API keys for the current user.
    """
    # Get all API keys for the user
    api_keys = await get_api_keys(current_user["_id"])
    
    # Convert to response model (without exposing the actual keys)
    api_key_responses = [
        ApiKeyResponse(
            id=key["id"],
            name=key["name"],
            prefix=key["prefix"],
            created_at=key["created_at"],
            last_used=key.get("last_used"),
        )
        for key in api_keys
    ]
    
    return {
        "success": True,
        "data": api_key_responses,
    }

async def create_new_api_key(
    key_data: ApiKeyCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Create a new API key for the current user.
    """
    # Create the API key
    api_key = await create_api_key(
        user_id=current_user["_id"],
        name=key_data.name,
        prefix=key_data.prefix or "pk_dev_",
    )
    
    # Convert to response model
    api_key_response = ApiKeyFullResponse(
        id=api_key["id"],
        name=api_key["name"],
        prefix=api_key["prefix"],
        key=api_key["key"],
        created_at=api_key["created_at"],
        last_used=api_key.get("last_used"),
    )
    
    return {
        "success": True,
        "data": api_key_response,
        "message": "API key created successfully. Please save this key as it will not be shown again.",
    }

async def rotate_existing_api_key(
    key_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Rotate (regenerate) an existing API key.
    """
    try:
        # Rotate the API key
        api_key = await rotate_api_key(key_id, current_user["_id"])
        
        # Convert to response model
        api_key_response = ApiKeyFullResponse(
            id=api_key["id"],
            name=api_key["name"],
            prefix=api_key["prefix"],
            key=api_key["key"],
            created_at=api_key["created_at"],
            last_used=api_key.get("last_used"),
        )
        
        return {
            "success": True,
            "data": api_key_response,
            "message": "API key rotated successfully. Please save this key as it will not be shown again.",
        }
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

async def delete_existing_api_key(
    key_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Delete an existing API key.
    """
    try:
        # Delete the API key
        await delete_api_key(key_id, current_user["_id"])
        
        return {
            "success": True,
            "message": "API key deleted successfully",
        }
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )