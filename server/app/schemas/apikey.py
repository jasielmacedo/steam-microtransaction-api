from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

# Request and response schemas
class ApiKeyBase(BaseModel):
    """Base schema for API key"""
    name: str

class ApiKeyCreate(ApiKeyBase):
    """Schema for creating an API key"""
    prefix: Optional[str] = "pk_dev_"  # Default prefix for dev keys

class ApiKeyResponse(ApiKeyBase):
    """Response schema for API key"""
    id: str
    prefix: str
    created_at: datetime
    last_used: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }

class ApiKeyFullResponse(ApiKeyResponse):
    """Response schema for API key including the actual key"""
    key: str

class ApiKeyListResponse(BaseModel):
    """Response schema for list of API keys"""
    success: bool = True
    data: List[ApiKeyResponse]

class ApiKeyDetailResponse(BaseModel):
    """Response schema for a single API key"""
    success: bool = True
    data: ApiKeyFullResponse

class ApiKeyCreateResponse(BaseModel):
    """Response schema for creating an API key"""
    success: bool = True
    data: ApiKeyFullResponse
    message: str = "API key created successfully. Please save this key as it will not be shown again."

class ApiKeyRotateResponse(BaseModel):
    """Response schema for rotating an API key"""
    success: bool = True
    data: ApiKeyFullResponse
    message: str = "API key rotated successfully. Please save this key as it will not be shown again."

class ApiKeyDeleteResponse(BaseModel):
    """Response schema for deleting an API key"""
    success: bool = True
    message: str = "API key deleted successfully"