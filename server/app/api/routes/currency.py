from fastapi import APIRouter

from app.api.controllers.currency import (
    get_currencies,
    get_default_currency_settings
)

router = APIRouter()

router.add_api_route(
    "/",
    get_currencies,
    methods=["GET"],
    summary="Get all supported currencies",
    description="Returns all supported currencies with their details",
)

router.add_api_route(
    "/{currency_code}/settings",
    get_default_currency_settings,
    methods=["GET"],
    summary="Get default settings for a currency",
    description="Returns default settings for a specific currency",
)