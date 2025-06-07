from datetime import timedelta
from typing import Dict, Any

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.models.user import User, UserRole
from app.api.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    LoginRequest,
    LoginResponse,
    PasswordUpdate,
    UserWithApiKey
)
from app.api.schemas.common import ApiResponse
from app.core.config import settings
from app.core.exceptions import UnauthorizedException, ConflictException, BadRequestException
from app.core.security import create_access_token, get_current_user, authorize_user
from app.db.sqlite import async_session

# Router definition
router = APIRouter()


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    session: AsyncSession = Depends(async_session),
):
    """Register a new user."""
    # Create user
    user = await User.create(session, user_data.model_dump())
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "role": user.role},
    )
    
    # Create response
    return {
        "success": True,
        "token": access_token,
        "user": UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            steam_id=user.steam_id,
            created_at=user.created_at,
        )
    }


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    session: AsyncSession = Depends(async_session),
):
    """Login user."""
    # Authenticate user
    user = await User.authenticate(session, request.email, request.password)
    
    if not user:
        raise UnauthorizedException("Invalid email or password")
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "role": user.role},
    )
    
    # Create response
    return {
        "success": True,
        "token": access_token,
        "user": UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            steam_id=user.steam_id,
            created_at=user.created_at,
        )
    }


@router.post("/login/token", include_in_schema=False)
async def login_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(async_session),
):
    """Login endpoint for OAuth2 token flow."""
    # Authenticate user
    user = await User.authenticate(session, form_data.username, form_data.password)
    
    if not user:
        raise UnauthorizedException("Invalid email or password")
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "role": user.role},
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=ApiResponse[UserResponse])
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user info."""
    user = UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        role=current_user["role"],
        steam_id=current_user.get("steam_id"),
        created_at=current_user["created_at"],
    )
    return ApiResponse.success_response(user)


@router.put("/me", response_model=ApiResponse[UserResponse])
async def update_me(
    update_data: UserUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(async_session),
):
    """Update current user."""
    # Prevent regular users from changing their role
    if update_data.role and current_user["role"] != UserRole.ADMIN:
        raise BadRequestException("Regular users cannot change their role")
    
    # Update user
    updated_user = await User.update(
        session,
        current_user["id"],
        update_data.model_dump(exclude_none=True)
    )
    
    user = UserResponse(
        id=updated_user.id,
        email=updated_user.email,
        name=updated_user.name,
        role=updated_user.role,
        steam_id=updated_user.steam_id,
        created_at=updated_user.created_at,
    )
    
    return ApiResponse.success_response(user)


@router.put("/updatepassword", response_model=LoginResponse)
async def update_password(
    password_data: PasswordUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(async_session),
):
    """Update user password."""
    # Get user with password
    user = await User.get_by_id(session, current_user["id"])
    
    # Verify current password
    if not User.verify_password(password_data.current_password, user.password):
        raise UnauthorizedException("Current password is incorrect")
    
    # Update password
    updated_user = await User.update(
        session,
        current_user["id"],
        {"password": password_data.new_password}
    )
    
    # Create new access token
    access_token = create_access_token(
        data={"sub": updated_user.id, "role": updated_user.role},
    )
    
    return {
        "success": True,
        "token": access_token,
        "user": UserResponse(
            id=updated_user.id,
            email=updated_user.email,
            name=updated_user.name,
            role=updated_user.role,
            steam_id=updated_user.steam_id,
            created_at=updated_user.created_at,
        )
    }


@router.post("/generateapikey", response_model=dict)
async def generate_api_key(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(async_session),
):
    """Generate new API key for user."""
    # Generate API key
    api_key = await User.generate_api_key(session, current_user["id"])
    
    # We keep this response format to be compatible with frontend
    return {
        "success": True,
        "apiKey": api_key,
    }


@router.post("/logout")
async def logout(response: Response):
    """Logout user (client-side only)."""
    # Note: JWT tokens cannot be invalidated on the server side
    # This endpoint is for client-side logout only
    return {"success": True, "message": "Logged out successfully"}