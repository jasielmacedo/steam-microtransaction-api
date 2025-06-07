from fastapi import APIRouter

from app.api.controllers.settings import (
    get_settings,
    update_settings,
    test_notification,
)

# Router configuration
router = APIRouter()

# Route registration
router.add_api_route("/settings", get_settings, methods=["GET"])
router.add_api_route("/settings", update_settings, methods=["PUT"])
router.add_api_route("/settings/test-notification", test_notification, methods=["POST"])