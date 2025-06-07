from fastapi import APIRouter

from app.api.controllers.steam import (
    get_reliable_user_info,
    check_app_ownership,
    init_purchase,
    finalize_purchase,
    check_purchase_status,
)

# Router configuration
router = APIRouter()

# Route registration
router.add_api_route("/GetReliableUserInfo", get_reliable_user_info, methods=["POST"])
router.add_api_route("/CheckAppOwnership", check_app_ownership, methods=["POST"])
router.add_api_route("/InitPurchase", init_purchase, methods=["POST"])
router.add_api_route("/FinalizePurchase", finalize_purchase, methods=["POST"])
router.add_api_route("/CheckPurchaseStatus", check_purchase_status, methods=["POST"])