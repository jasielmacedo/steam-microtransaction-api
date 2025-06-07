from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from enum import Enum

class Currency(str, Enum):
    """Supported Steam currencies."""
    AED = "AED"  # United Arab Emirates Dirham
    AUD = "AUD"  # Australian Dollars
    BRL = "BRL"  # Brazilian Reals
    CAD = "CAD"  # Canadian Dollars
    CHF = "CHF"  # Swiss Francs
    CLP = "CLP"  # Chilean Peso
    CNY = "CNY"  # Chinese Renminbi (yuan)
    COP = "COP"  # Colombian Peso
    CRC = "CRC"  # Costa Rican Colón
    EUR = "EUR"  # European Union Euro
    GBP = "GBP"  # United Kingdom Pound
    HKD = "HKD"  # Hong Kong Dollar
    ILS = "ILS"  # Israeli New Shekel
    IDR = "IDR"  # Indonesian Rupiah
    INR = "INR"  # Indian Rupee
    JPY = "JPY"  # Japanese Yen
    KRW = "KRW"  # South Korean Won
    KWD = "KWD"  # Kuwaiti Dinar
    KZT = "KZT"  # Kazakhstani Tenge
    MXN = "MXN"  # Mexican Peso
    MYR = "MYR"  # Malaysian Ringgit
    NOK = "NOK"  # Norwegian Krone
    NZD = "NZD"  # New Zealand Dollar
    PEN = "PEN"  # Peruvian Sol
    PHP = "PHP"  # Philippine Peso
    PLN = "PLN"  # Polish Złoty
    QAR = "QAR"  # Qatari Riyal
    RUB = "RUB"  # Russian Rouble
    SAR = "SAR"  # Saudi Riyal
    SGD = "SGD"  # Singapore Dollar
    THB = "THB"  # Thai Baht
    TWD = "TWD"  # New Taiwan Dollar
    UAH = "UAH"  # Ukrainian Hryvnia
    USD = "USD"  # United States Dollar
    USD_CIS = "USD_CIS"  # USD for Commonwealth of Independent States
    USD_LATAM = "USD_LATAM"  # USD for Latin America
    USD_MENA = "USD_MENA"  # USD for Middle East and North Africa
    USD_SASIA = "USD_SASIA"  # USD for South Asia
    UYU = "UYU"  # Uruguayan Peso
    VND = "VND"  # Vietnamese Dong
    ZAR = "ZAR"  # South African Rand

class CurrencySettings(BaseModel):
    """Currency settings for pricing in different regions."""
    code: Currency = Field(..., description="Currency code")
    min_price_increment: int = Field(1, description="Minimum price increment (in smallest unit)")
    fractional_unit: str = Field("cents", description="Name of fractional unit (cents, pence, etc.)")
    
    class Config:
        use_enum_values = True

class GameBase(BaseModel):
    """Base schema for game."""
    name: str = Field(..., description="Game name")
    description: str = Field(..., description="Game description")
    steam_app_id: str = Field(..., description="Steam App ID")
    active: bool = Field(True, description="Whether the game is active")
    publisher: Optional[str] = Field(None, description="Game publisher")
    developer: Optional[str] = Field(None, description="Game developer")
    release_date: Optional[str] = Field(None, description="Game release date")
    image_url: Optional[str] = Field(None, description="Game image URL")
    default_currency: Currency = Field(Currency.USD, description="Default currency for this game")
    supported_currencies: Optional[List[CurrencySettings]] = Field(None, description="Supported currencies for this game")

class GameCreate(GameBase):
    """Schema for creating a game."""
    
    @validator('steam_app_id')
    def validate_steam_app_id(cls, v):
        if not v:
            raise ValueError("Steam App ID is required")
        # Steam App IDs are usually numeric
        try:
            int(v)
        except ValueError:
            pass  # We allow non-numeric values for flexibility
        return v

class GameUpdate(BaseModel):
    """Schema for updating a game."""
    name: Optional[str] = None
    description: Optional[str] = None
    steam_app_id: Optional[str] = None
    active: Optional[bool] = None
    publisher: Optional[str] = None
    developer: Optional[str] = None
    release_date: Optional[str] = None
    image_url: Optional[str] = None
    
    @validator('steam_app_id')
    def validate_steam_app_id(cls, v):
        if v is not None and not v:
            raise ValueError("Steam App ID cannot be empty")
        if v is not None:
            # Steam App IDs are usually numeric
            try:
                int(v)
            except ValueError:
                pass  # We allow non-numeric values for flexibility
        return v

class GameResponse(GameBase):
    """Schema for game response."""
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }

class GameListResponse(BaseModel):
    """Schema for game list response."""
    success: bool = True
    count: int
    data: List[GameResponse]
    
class GamesResponse(BaseModel):
    """Schema for games pagination response."""
    items: List[GameResponse]
    total: int
    page: int
    size: int
    pages: int

class GameDetailResponse(BaseModel):
    """Schema for game detail response."""
    success: bool = True
    data: GameResponse

class GameDeleteResponse(BaseModel):
    """Schema for game delete response."""
    success: bool = True
    message: str = "Game deleted successfully"