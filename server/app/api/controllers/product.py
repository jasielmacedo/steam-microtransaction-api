from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException

from app.api.models.user import UserRole
from app.api.models.product import Product
from app.api.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductDetailResponse,
    ProductDeleteResponse
)
from app.core.exceptions import ForbiddenException
from app.core.security import get_current_user, authorize_user

async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    active_only: bool = Query(False),
    search: Optional[str] = Query(None, description="Search term"),
    steam_app_id: Optional[str] = Query(None, description="Filter by Steam App ID"),
    game_id: Optional[str] = Query(None, description="Filter by Game ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Get all products.
    Can be filtered to active-only and paginated.
    """
    team_id = current_user.get("team_id") if current_user.get("role") != UserRole.ADMIN else None
    
    # Get products
    products, total = await Product.get_all(
        skip=skip, 
        limit=limit, 
        active_only=active_only,
        steam_app_id=steam_app_id,
        game_id=game_id,
        search=search,
        team_id=team_id
    )
    
    # Return response
    return {
        "success": True,
        "count": len(products),
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit,
        "data": products,
    }

async def get_product(
    product_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Get product by ID.
    """
    try:
        # Get product
        product = await Product.get_by_id(product_id)
        
        # Return response
        return {
            "success": True,
            "data": product,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

async def create_product(
    product_data: ProductCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Create a new product.
    Admin only.
    """
    # Check if user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can create products")
    
    try:
        # Create product
        product = await Product.create(product_data.model_dump())
        
        # Return response
        return {
            "success": True,
            "data": product,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

async def update_product(
    product_id: str,
    update_data: ProductUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Update product.
    Admin only.
    """
    # Check if user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can update products")
    
    try:
        # Update product
        updated_product = await Product.update(
            product_id, update_data.model_dump(exclude_none=True)
        )
        
        # Return response
        return {
            "success": True,
            "data": updated_product,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

async def delete_product(
    product_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Delete product.
    Admin only.
    """
    # Check if user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can delete products")
    
    try:
        # Delete product
        await Product.delete(product_id)
        
        # Return response
        return {
            "success": True,
            "message": "Product deleted successfully",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )