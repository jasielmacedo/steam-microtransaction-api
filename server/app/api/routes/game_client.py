from fastapi import APIRouter

from app.api.controllers.game_client import get_game_products

# Router configuration
router = APIRouter()

# Route registration
router.add_api_route("/products", get_game_products, methods=["GET"])