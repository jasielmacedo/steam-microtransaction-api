from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError

from app.api.models.user import User
from app.api.schemas.user import TokenData
from app.core.config import settings
from app.core.exceptions import UnauthorizedException, ForbiddenException


# OAuth2 configuration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login")


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # Create JWT token
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """Validate and decode JWT token to get current user."""
    try:
        # Decode JWT token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        # Extract user ID and role
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        
        if user_id is None:
            raise UnauthorizedException("Could not validate credentials")
        
        # Create token data
        token_data = TokenData(id=user_id, role=role)
    except (JWTError, ValidationError):
        raise UnauthorizedException("Could not validate credentials")
    
    # Get user from database
    user = await User.get_by_id(token_data.id)
    if user is None:
        raise UnauthorizedException("User not found")
    
    # Remove password from user data
    user.pop("password", None)
    return user


def authorize_user(allowed_roles: list) -> Any:
    """Dependency to authorize user by role."""
    
    async def authorized_user(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        if current_user["role"] not in allowed_roles:
            raise ForbiddenException(f"User role {current_user['role']} is not authorized for this action")
        return current_user
    
    return authorized_user


async def verify_api_key(api_key: str) -> Dict[str, Any]:
    """Verify API key and return user."""
    if not api_key:
        raise UnauthorizedException("API key is required")
    
    user = await User.get_by_api_key(api_key)
    if not user:
        raise UnauthorizedException("Invalid API key")
    
    # Remove password from user data
    user.pop("password", None)
    return user