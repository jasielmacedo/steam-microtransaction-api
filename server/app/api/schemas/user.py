from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator

from app.api.models.user import UserRole


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    name: str


class UserCreate(UserBase):
    """Schema for creating a user."""
    password: str = Field(..., min_length=6)
    role: Optional[UserRole] = UserRole.USER
    steam_id: Optional[str] = None


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[UserRole] = None
    steam_id: Optional[str] = None


class UserInDB(UserBase):
    """Schema for user in database."""
    id: str = Field(..., alias="_id")
    role: UserRole
    steam_id: Optional[str] = None
    api_key: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True


class UserResponse(UserBase):
    """Schema for user response."""
    id: str
    role: UserRole
    steam_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "name": "John Doe",
                "role": "user",
                "steam_id": "76561198123456789",
                "created_at": "2023-01-01T00:00:00",
            }
        }


class UserWithApiKey(UserResponse):
    """Schema for user response with API key."""
    api_key: str


class Token(BaseModel):
    """Schema for JWT token."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for JWT token data."""
    id: str
    role: UserRole


class LoginRequest(BaseModel):
    """Schema for login request."""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Schema for login response."""
    success: bool = True
    token: str
    user: UserResponse


class PasswordUpdate(BaseModel):
    """Schema for password update."""
    current_password: str
    new_password: str = Field(..., min_length=6)
    
    @validator("new_password")
    def passwords_match(cls, v, values):
        if "current_password" in values and v == values["current_password"]:
            raise ValueError("New password must be different from current password")
        return v