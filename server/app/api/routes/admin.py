from fastapi import APIRouter

from app.api.controllers.admin import (
    get_users,
    get_user,
    create_user,
    update_user,
    delete_user,
)

# Router configuration
router = APIRouter()

# Route registration
router.add_api_route("/users", get_users, methods=["GET"])
router.add_api_route("/users/{user_id}", get_user, methods=["GET"])
router.add_api_route("/users", create_user, methods=["POST"])
router.add_api_route("/users/{user_id}", update_user, methods=["PUT"])
router.add_api_route("/users/{user_id}", delete_user, methods=["DELETE"])