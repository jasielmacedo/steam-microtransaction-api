from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, validator

class TransactionBase(BaseModel):
    """Base schema for transaction."""
    type: str = Field(..., description="Transaction type")
    order_id: Optional[str] = Field(None, description="Order ID")
    trans_id: Optional[str] = Field(None, description="Transaction ID from Steam")
    app_id: Optional[str] = Field(None, description="App ID")
    steam_id: Optional[str] = Field(None, description="Steam user ID")
    user_id: Optional[str] = Field(None, description="User ID in our system")
    product_id: Optional[str] = Field(None, description="Product ID")
    product_name: Optional[str] = Field(None, description="Product name")
    amount: Optional[float] = Field(None, description="Transaction amount")
    currency: Optional[str] = Field("USD", description="Currency code")
    status: Optional[str] = Field("pending", description="Transaction status")
    
    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ["pending", "completed", "failed"]
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v


class TransactionCreate(TransactionBase):
    """Schema for creating a transaction."""
    pass


class TransactionUpdate(BaseModel):
    """Schema for updating a transaction."""
    order_id: Optional[str] = None
    trans_id: Optional[str] = None
    app_id: Optional[str] = None
    steam_id: Optional[str] = None
    user_id: Optional[str] = None
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    response: Optional[Dict[str, Any]] = None
    
    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = ["pending", "completed", "failed"]
            if v not in allowed_statuses:
                raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v


class TransactionResponse(TransactionBase):
    """Schema for transaction response."""
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: Optional[datetime] = None
    response: Optional[Dict[str, Any]] = None
    
    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }


class TransactionListResponse(BaseModel):
    """Schema for transaction list response."""
    success: bool = True
    count: int
    data: List[TransactionResponse]


class TransactionDetailResponse(BaseModel):
    """Schema for transaction detail response."""
    success: bool = True
    data: TransactionResponse


class TransactionStats(BaseModel):
    """Schema for transaction statistics."""
    total_count: int
    completed_count: int
    failed_count: int
    pending_count: int
    total_revenue: float
    currency: str
    period_days: int


class StatsResponse(BaseModel):
    """Schema for statistics response."""
    success: bool = True
    data: TransactionStats


class ChartDataPoint(BaseModel):
    """Schema for a single data point in chart data."""
    date: str
    revenue: float
    count: int


class ChartDataResponse(BaseModel):
    """Schema for chart data response."""
    success: bool = True
    data: List[ChartDataPoint]


class TopProduct(BaseModel):
    """Schema for top product response."""
    id: str
    product_name: str
    revenue: float
    count: int


class TopProductsResponse(BaseModel):
    """Schema for top products response."""
    success: bool = True
    data: List[TopProduct]


class RecentTransaction(BaseModel):
    """Schema for recent transaction response."""
    id: str = Field(..., alias="_id")
    type: str
    created_at: datetime
    steam_id: Optional[str] = None
    product_name: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    
    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }


class RecentTransactionsResponse(BaseModel):
    """Schema for recent transactions response."""
    success: bool = True
    data: List[RecentTransaction]