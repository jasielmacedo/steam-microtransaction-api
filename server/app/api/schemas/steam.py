from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field


class GetReliableUserInfoRequest(BaseModel):
    """Schema for getting reliable user info."""
    steam_id: str = Field(..., description="User Steam ID")
    game_id: Optional[str] = Field(None, description="Game ID from database (optional)")


class CheckAppOwnershipRequest(BaseModel):
    """Schema for checking app ownership."""
    steam_id: str = Field(..., description="User Steam ID")
    game_id: str = Field(..., description="Game ID from database")


class InitPurchaseRequest(BaseModel):
    """Schema for initializing purchase."""
    product_id: str = Field(..., description="Product ID from database")
    steam_id: str = Field(..., description="User Steam ID")
    quantity: int = Field(1, description="Quantity of items to purchase")


class FinalizePurchaseRequest(BaseModel):
    """Schema for finalizing purchase."""
    trans_id: str = Field(..., description="Transaction ID returned from initPurchase")


class CheckPurchaseStatusRequest(BaseModel):
    """Schema for checking purchase status."""
    trans_id: str = Field(..., description="Transaction ID returned from initPurchase")


class PurchaseItem(BaseModel):
    """Schema for purchase item."""
    itemid: str
    qty: int
    amount: str
    vat: str
    itemstatus: str


class PurchaseStatusResponse(BaseModel):
    """Schema for purchase status response."""
    success: bool
    orderid: str
    transid: str
    steamid: str
    status: str
    currency: str
    time: str
    country: str
    usstate: str
    items: List[Dict[str, Any]]


class InitPurchaseResponse(BaseModel):
    """Schema for initializing purchase response."""
    transid: str


class SuccessResponse(BaseModel):
    """Schema for success response."""
    success: bool = True