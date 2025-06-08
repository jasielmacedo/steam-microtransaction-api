from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.admin import router as admin_router
from app.api.routes.steam import router as steam_router
from app.api.routes.team import router as team_router
from app.api.routes.product import router as product_router
from app.api.routes.transaction import router as transaction_router
from app.api.routes.game import router as game_router
from app.api.routes.currency import router as currency_router
from app.api.routes.export import router as export_router
from app.api.routes.settings import router as settings_router
from app.api.routes.game_client import router as game_client_router
from app.api.routes.apikey import router as apikey_router

# Create main API router
api_router = APIRouter()

# Include all routers
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(admin_router, prefix="/admin", tags=["Admin"])
api_router.include_router(team_router, prefix="/admin/team", tags=["Team"])
api_router.include_router(transaction_router, prefix="/admin/transactions", tags=["Transactions"])
api_router.include_router(game_router, prefix="/admin/games", tags=["Games"])
api_router.include_router(currency_router, prefix="/admin/currencies", tags=["Currencies"])
api_router.include_router(export_router, prefix="/admin", tags=["Export"])
api_router.include_router(settings_router, prefix="/admin", tags=["Settings"])
api_router.include_router(product_router, prefix="/products", tags=["Products"])
api_router.include_router(game_client_router, prefix="/game-client", tags=["Game Client"])
api_router.include_router(apikey_router, prefix="/api-keys", tags=["API Keys"])
api_router.include_router(steam_router, prefix="", tags=["Steam"])