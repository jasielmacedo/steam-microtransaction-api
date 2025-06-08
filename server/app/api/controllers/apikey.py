from typing import Dict, Any

from fastapi import Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.models.apikey import ApiKey
from app.db.sqlite import async_session
from app.core.security import get_current_user
from app.schemas.apikey import (
    ApiKeyCreate,
    ApiKeyListResponse,
    ApiKeyCreateResponse,
    ApiKeyRotateResponse,
    ApiKeyDeleteResponse,
    ApiKeyResponse,
    ApiKeyFullResponse,
)


async def list_api_keys(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(async_session),
):
    """List API keys for the current user."""
    keys = await ApiKey.get_by_user(session, current_user["id"])
    key_responses = [
        ApiKeyResponse(
            id=k.id,
            name=k.name,
            prefix=k.prefix,
            created_at=k.created_at,
            last_used=k.last_used,
        )
        for k in keys
    ]
    return ApiKeyListResponse(data=key_responses)


async def create_api_key(
    key_data: ApiKeyCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(async_session),
):
    """Create a new API key and return the plain key."""
    key, plain = await ApiKey.create(
        session, current_user["id"], key_data.name, key_data.prefix
    )
    key_response = ApiKeyFullResponse(
        id=key.id,
        name=key.name,
        prefix=key.prefix,
        created_at=key.created_at,
        last_used=key.last_used,
        key=plain,
    )
    return ApiKeyCreateResponse(data=key_response)


async def rotate_api_key(
    key_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(async_session),
):
    """Rotate an existing API key and return the new key."""
    try:
        key, plain = await ApiKey.rotate(session, key_id, current_user["id"])
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    key_response = ApiKeyFullResponse(
        id=key.id,
        name=key.name,
        prefix=key.prefix,
        created_at=key.created_at,
        last_used=key.last_used,
        key=plain,
    )
    return ApiKeyRotateResponse(data=key_response)


async def delete_api_key(
    key_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(async_session),
):
    """Delete an API key."""
    try:
        await ApiKey.delete(session, key_id, current_user["id"])
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    return ApiKeyDeleteResponse()
