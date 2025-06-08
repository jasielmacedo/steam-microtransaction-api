from fastapi import APIRouter, Depends

from app.api.controllers.apikey import (
    list_api_keys,
    create_api_key,
    rotate_api_key,
    delete_api_key,
)
from app.core.security import get_current_user
from app.schemas.apikey import (
    ApiKeyListResponse,
    ApiKeyCreateResponse,
    ApiKeyRotateResponse,
    ApiKeyDeleteResponse,
    ApiKeyCreate,
)

router = APIRouter(dependencies=[Depends(get_current_user)])

router.add_api_route(
    "",
    list_api_keys,
    methods=["GET"],
    response_model=ApiKeyListResponse,
    summary="List API keys",
)

router.add_api_route(
    "",
    create_api_key,
    methods=["POST"],
    response_model=ApiKeyCreateResponse,
    status_code=201,
    summary="Create API key",
)

router.add_api_route(
    "/{key_id}/rotate",
    rotate_api_key,
    methods=["POST"],
    response_model=ApiKeyRotateResponse,
    summary="Rotate API key",
)

router.add_api_route(
    "/{key_id}",
    delete_api_key,
    methods=["DELETE"],
    response_model=ApiKeyDeleteResponse,
    summary="Delete API key",
)
