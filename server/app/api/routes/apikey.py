from fastapi import APIRouter, Depends

from app.api.controllers.apikey import (
    list_api_keys,
    create_new_api_key,
    rotate_existing_api_key,
    delete_existing_api_key,
)
from app.core.security import get_current_user
from app.schemas.apikey import (
    ApiKeyCreate,
    ApiKeyListResponse,
    ApiKeyCreateResponse,
    ApiKeyRotateResponse,
    ApiKeyDeleteResponse,
)

# Router configuration with authentication
router = APIRouter(dependencies=[Depends(get_current_user)])

# Route registration
router.add_api_route(
    "",
    list_api_keys,
    methods=["GET"],
    response_model=ApiKeyListResponse,
    summary="List API keys",
    description="Returns a list of all API keys for the current user",
)

router.add_api_route(
    "",
    create_new_api_key,
    methods=["POST"],
    response_model=ApiKeyCreateResponse,
    status_code=201,
    summary="Create API key",
    description="Creates a new API key for the current user",
)

router.add_api_route(
    "/{key_id}/rotate",
    rotate_existing_api_key,
    methods=["POST"],
    response_model=ApiKeyRotateResponse,
    summary="Rotate API key",
    description="Rotates (regenerates) an existing API key",
)

router.add_api_route(
    "/{key_id}",
    delete_existing_api_key,
    methods=["DELETE"],
    response_model=ApiKeyDeleteResponse,
    summary="Delete API key",
    description="Deletes an existing API key",
)