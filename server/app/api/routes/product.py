from fastapi import APIRouter, Depends

from app.api.controllers.product import (
    get_products,
    get_product,
    create_product,
    update_product,
    delete_product,
)
from app.api.models.user import UserRole
from app.core.security import authorize_user, get_current_user
from app.api.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductListResponse,
    ProductDetailResponse,
    ProductDeleteResponse,
)

# Router configuration - need to be authenticated but no admin requirement yet
# (admin check happens in the controller functions)
router = APIRouter(dependencies=[Depends(get_current_user)])

# Route registration
router.add_api_route(
    "",
    get_products,
    methods=["GET"],
    response_model=ProductListResponse,
    summary="Get all products",
    description="Returns a list of all products, optionally filtered by active status",
)

router.add_api_route(
    "/{product_id}",
    get_product,
    methods=["GET"],
    response_model=ProductDetailResponse,
    summary="Get product by ID",
    description="Returns a single product by ID",
)

router.add_api_route(
    "",
    create_product,
    methods=["POST"],
    response_model=ProductDetailResponse,
    status_code=201,
    summary="Create product",
    description="Creates a new product (admin only)",
)

router.add_api_route(
    "/{product_id}",
    update_product,
    methods=["PUT"],
    response_model=ProductDetailResponse,
    summary="Update product",
    description="Updates an existing product (admin only)",
)

router.add_api_route(
    "/{product_id}",
    delete_product,
    methods=["DELETE"],
    response_model=ProductDeleteResponse,
    summary="Delete product",
    description="Deletes a product (admin only)",
)