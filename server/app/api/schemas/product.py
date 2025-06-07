from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator, model_validator

class ProductBase(BaseModel):
    """Base schema for product."""
    name: str
    description: str
    price_cents: Optional[int] = Field(None, description="Price in cents (integer)")
    type: str
    active: bool = True
    game_id: Optional[str] = Field(None, description="ID of the game this product belongs to")
    steam_app_id: Optional[str] = None
    steam_item_id: Optional[int] = None
    steam_category: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    # Image URLs
    icon_url: Optional[str] = Field(None, description="URL to the product icon")
    icon_url_large: Optional[str] = Field(None, description="URL to the large product icon")
    # Steam attributes
    marketable: Optional[bool] = Field(False, description="Can be sold on the Steam market")
    tradable: Optional[bool] = Field(False, description="Can be traded between users")
    store_bundle: Optional[bool] = Field(False, description="Item contains other items")
    quantity: Optional[int] = Field(1, description="Default quantity per purchase")
    tags: Optional[List[str]] = Field(None, description="Product tags")
    store_tags: Optional[List[str]] = Field(None, description="Store display tags")
    store_categories: Optional[List[str]] = Field(None, description="Store categories")
    background_color: Optional[str] = Field(None, description="Hex color code for display")
    # Legacy field for backward compatibility
    price: Optional[float] = Field(None, description="Deprecated: Use price_cents instead")

class ProductCreate(ProductBase):
    """Schema for creating a product."""
    
    @validator('price_cents')
    def validate_price_cents(cls, v, values):
        if v is not None and v <= 0:
            raise ValueError("Price in cents must be greater than 0")
        return v
    
    @validator('price')
    def validate_price(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Price must be greater than 0")
        return v
    
    @model_validator(mode='after')
    def ensure_price_data(self):
        price = self.price
        price_cents = self.price_cents
        
        # Ensure at least one pricing field is provided
        if price is None and price_cents is None:
            raise ValueError("Either price or price_cents must be provided")
        
        # If price is provided but price_cents is not, convert price to cents
        if price is not None and price_cents is None:
            self.price_cents = int(price * 100)
            
        return self
    
    @validator('type')
    def validate_type(cls, v):
        allowed_types = ["Currency", "Cosmetic", "Booster", "Subscription", "Equipment", "Bundle", "Content", "Consumable"]
        if v not in allowed_types:
            raise ValueError(f"Type must be one of: {', '.join(allowed_types)}")
        return v

class ProductUpdate(BaseModel):
    """Schema for updating a product."""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    price_cents: Optional[int] = None
    type: Optional[str] = None
    active: Optional[bool] = None
    game_id: Optional[str] = Field(None, description="ID of the game this product belongs to")
    steam_app_id: Optional[str] = None
    steam_item_id: Optional[int] = None
    steam_category: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    
    @validator('price_cents')
    def validate_price_cents(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Price in cents must be greater than 0")
        return v
    
    @validator('price')
    def validate_price(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Price must be greater than 0")
        return v
    
    @model_validator(mode='after')
    def handle_price_conversion(self):
        price = self.price
        price_cents = self.price_cents
        
        # If price is provided but price_cents is not, convert price to cents
        if price is not None and price_cents is None:
            self.price_cents = int(price * 100)
        
        return self
    
    @validator('type')
    def validate_type(cls, v):
        if v is not None:
            allowed_types = ["Currency", "Cosmetic", "Booster", "Subscription", "Equipment", "Bundle", "Content", "Consumable"]
            if v not in allowed_types:
                raise ValueError(f"Type must be one of: {', '.join(allowed_types)}")
        return v

class ProductResponse(ProductBase):
    """Schema for product response."""
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }

class ProductListResponse(BaseModel):
    """Schema for product list response."""
    success: bool = True
    count: int
    data: List[ProductResponse]

class ProductDetailResponse(BaseModel):
    """Schema for product detail response."""
    success: bool = True
    data: ProductResponse

class ProductDeleteResponse(BaseModel):
    """Schema for product delete response."""
    success: bool = True
    message: str = "Product deleted successfully"

class GameClientProductResponse(BaseModel):
    """Schema for game client product response with minimal information."""
    id: str = Field(..., alias="_id")
    name: str
    description: str
    price_cents: int
    type: str
    steam_item_id: int
    icon_url: Optional[str] = None
    icon_url_large: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    background_color: Optional[str] = None
    quantity: Optional[int] = Field(1, description="Default quantity per purchase")
    
    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }

class GameClientProductListResponse(BaseModel):
    """Schema for game client product list response."""
    success: bool = True
    count: int
    game_id: str
    steam_app_id: str
    products: List[GameClientProductResponse]