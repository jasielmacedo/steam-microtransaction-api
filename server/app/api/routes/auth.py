from fastapi import APIRouter

from app.api.controllers.auth import (
    register,
    login,
    login_token,
    get_me,
    update_me,
    update_password,
    generate_api_key,
    logout,
)

# Router configuration
router = APIRouter()

# Route registration
router.add_api_route("/register", register, methods=["POST"])
router.add_api_route("/login", login, methods=["POST"])
router.add_api_route("/login/token", login_token, methods=["POST"])
router.add_api_route("/me", get_me, methods=["GET"])
router.add_api_route("/me", update_me, methods=["PUT"])
router.add_api_route("/updatepassword", update_password, methods=["PUT"])
router.add_api_route("/generateapikey", generate_api_key, methods=["POST"])
router.add_api_route("/logout", logout, methods=["POST"])