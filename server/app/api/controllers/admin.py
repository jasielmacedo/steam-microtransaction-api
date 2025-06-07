from typing import Dict, Any, List

from fastapi import APIRouter, Depends, Query, status

from app.api.models.user import User, UserRole
from app.api.schemas.user import UserCreate, UserResponse, UserUpdate
from app.core.exceptions import ForbiddenException
from app.core.security import get_current_user, authorize_user

# Router definition with admin-only access
router = APIRouter(dependencies=[Depends(authorize_user([UserRole.ADMIN]))])


@router.get("/users", response_model=Dict[str, Any])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get all users with pagination."""
    # Ensure user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can access this endpoint")
    
    # Get users
    users = await User.get_all(skip=skip, limit=limit)
    
    # Convert to response model
    user_responses = [
        UserResponse(
            id=user["_id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            steam_id=user.get("steam_id"),
            created_at=user["created_at"],
        )
        for user in users
    ]
    
    return {
        "success": True,
        "count": len(user_responses),
        "data": user_responses,
    }


@router.get("/users/{user_id}", response_model=Dict[str, Any])
async def get_user(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get user by ID."""
    # Ensure user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can access this endpoint")
    
    # Get user
    user = await User.get_by_id(user_id)
    
    # Convert to response model
    user_response = UserResponse(
        id=user["_id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        steam_id=user.get("steam_id"),
        created_at=user["created_at"],
    )
    
    return {
        "success": True,
        "data": user_response,
    }


@router.post("/users", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a new user (admin only)."""
    # Ensure user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can access this endpoint")
    
    # Create user
    user = await User.create(user_data.model_dump())
    
    # Convert to response model
    user_response = UserResponse(
        id=user["_id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        steam_id=user.get("steam_id"),
        created_at=user["created_at"],
    )
    
    return {
        "success": True,
        "data": user_response,
    }


@router.put("/users/{user_id}", response_model=Dict[str, Any])
async def update_user(
    user_id: str,
    update_data: UserUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Update user (admin only)."""
    # Ensure user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can access this endpoint")
    
    # Update user
    updated_user = await User.update(
        user_id,
        update_data.model_dump(exclude_none=True)
    )
    
    # Convert to response model
    user_response = UserResponse(
        id=updated_user["_id"],
        email=updated_user["email"],
        name=updated_user["name"],
        role=updated_user["role"],
        steam_id=updated_user.get("steam_id"),
        created_at=updated_user["created_at"],
    )
    
    return {
        "success": True,
        "data": user_response,
    }


@router.delete("/users/{user_id}", response_model=Dict[str, Any])
async def delete_user(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Delete user (admin only)."""
    # Ensure user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can access this endpoint")
    
    # Prevent deleting self
    if user_id == current_user["_id"]:
        raise ForbiddenException("Cannot delete your own account")
    
    # Delete user
    await User.delete(user_id)
    
    return {
        "success": True,
        "data": {},
    }