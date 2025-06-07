from fastapi import APIRouter, Depends

from app.api.controllers.transaction import (
    get_transactions,
    get_transaction,
    get_transaction_stats,
    get_revenue_chart_data,
    get_top_products,
    get_recent_transactions,
)
from app.api.models.user import UserRole
from app.core.security import authorize_user, get_current_user
from app.api.schemas.transaction import (
    TransactionListResponse,
    TransactionDetailResponse,
    StatsResponse,
    ChartDataResponse,
    TopProductsResponse,
    RecentTransactionsResponse,
)

# Router configuration - admin only
router = APIRouter(dependencies=[Depends(authorize_user([UserRole.ADMIN]))])

# Route registration
# Statistical endpoints and specialized queries must be registered before generic endpoints
# to avoid path conflicts
router.add_api_route(
    "/stats",
    get_transaction_stats,
    methods=["GET"],
    response_model=StatsResponse,
    summary="Get transaction statistics",
    description="Returns transaction statistics for dashboard",
)

router.add_api_route(
    "/chart/revenue",
    get_revenue_chart_data,
    methods=["GET"],
    response_model=ChartDataResponse,
    summary="Get revenue chart data",
    description="Returns revenue chart data for dashboard",
)

router.add_api_route(
    "/top-products",
    get_top_products,
    methods=["GET"],
    response_model=TopProductsResponse,
    summary="Get top products",
    description="Returns top products by revenue",
)

router.add_api_route(
    "/recent",
    get_recent_transactions,
    methods=["GET"],
    response_model=RecentTransactionsResponse,
    summary="Get recent transactions",
    description="Returns recent transactions for dashboard",
)

# Generic transaction endpoints
router.add_api_route(
    "",
    get_transactions,
    methods=["GET"],
    response_model=TransactionListResponse,
    summary="Get all transactions",
    description="Returns a list of all transactions with filtering and pagination",
)

router.add_api_route(
    "/{transaction_id}",
    get_transaction,
    methods=["GET"],
    response_model=TransactionDetailResponse,
    summary="Get transaction by ID",
    description="Returns a single transaction by ID",
)