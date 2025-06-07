from fastapi import APIRouter

from app.api.controllers.steam import (
    get_reliable_user_info,
    check_app_ownership,
    init_purchase,
)

# Router configuration
router = APIRouter()

# Route registration
router.add_api_route("/GetReliableUserInfo", get_reliable_user_info, methods=["POST"])
router.add_api_route("/CheckAppOwnership", check_app_ownership, methods=["POST"])
router.add_api_route("/InitPurchase", init_purchase, methods=["POST"])
