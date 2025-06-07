from typing import Dict, Any, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, status, Query

from app.api.models.steam import SteamAPI
from app.api.models.product import Product
from app.api.models.game import Game
from app.api.schemas.steam import (
    GetReliableUserInfoRequest,
    CheckAppOwnershipRequest,
    InitPurchaseRequest,
    FinalizePurchaseRequest,
    CheckPurchaseStatusRequest,
    PurchaseStatusResponse,
    InitPurchaseResponse,
    SuccessResponse,
)
from app.core.exceptions import UnauthorizedException, NotFoundException
from app.core.security import verify_api_key

# Router definition
router = APIRouter()


@router.post("/GetReliableUserInfo", response_model=SuccessResponse)
async def get_reliable_user_info(
    request: GetReliableUserInfoRequest,
    x_api_key: str = Header(..., description="API Key"),
):
    """
    Check if the user is reliable to start purchase.
    Return true if user is reliable.
    """
    # Verify API key
    await verify_api_key(x_api_key)
    
    # Get Steam App ID from game if provided
    app_id = None
    if request.game_id:
        try:
            game = await Game.get_by_id(request.game_id)
            app_id = game.get("steam_app_id")
        except:
            # Continue even if game lookup fails
            pass
    
    # Call Steam API
    result = await SteamAPI.get_reliable_user_info(request.steam_id, app_id)
    return result


@router.post("/CheckAppOwnership", response_model=SuccessResponse)
async def check_app_ownership(
    request: CheckAppOwnershipRequest,
    x_api_key: str = Header(..., description="API Key"),
):
    """
    Check if the user really owns the AppId.
    Return success:true if the user owns the app.
    Useful to prevent purchase from non-owners.
    """
    # Verify API key
    await verify_api_key(x_api_key)
    
    try:
        # Get Steam App ID from game
        game = await Game.get_by_id(request.game_id)
        steam_app_id = game.get("steam_app_id")
        
        if not steam_app_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Game does not have a valid Steam App ID"
            )
        
        # Call Steam API
        result = await SteamAPI.check_app_ownership(request.steam_id, steam_app_id)
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking app ownership: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking app ownership: {str(e)}"
        )


@router.post("/InitPurchase", response_model=InitPurchaseResponse)
async def init_purchase(
    request: InitPurchaseRequest,
    x_api_key: str = Header(..., description="API Key"),
):
    """
    Init the purchase process.
    After this call, the steam will popup a confirmation dialog in the game.
    Requires a valid product_id from the database.
    """
    # Verify API key
    await verify_api_key(x_api_key)
    
    # Generate a unique order ID
    order_id = str(uuid4())
    
    try:
        # Get product details from database
        product = await Product.get_by_id(request.product_id)
        
        # Extract required fields
        product_name = product.get("name", "Unknown Product")
        steam_item_id = product.get("steam_item_id")
        
        # Get price in cents
        price_cents = product.get("price_cents")
        if price_cents is None and "price" in product:
            # Handle legacy products with price in dollars
            price_cents = int(product.get("price", 0) * 100)
        
        # For backward compatibility, if price_cents is still None, default to 100 cents (1 USD)
        if price_cents is None:
            price_cents = 100
        
        # Get game details
        game_id = product.get("game_id")
        steam_app_id = product.get("steam_app_id")
        game = None
        
        # If no steam_app_id in product, try to get it from the game
        if game_id:
            game = await Game.get_by_id(game_id)
            if not steam_app_id:
                steam_app_id = game.get("steam_app_id")
                
        # Get currency from game if available (overrides request currency)
        game_currency = None
        if game and "currency" in game:
            game_currency = game.get("currency")
        
        # Validate we have the required Steam API parameters
        if not steam_app_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product must be associated with a game that has a Steam App ID"
            )
        
        if not steam_item_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product does not have a valid Steam Item ID"
            )
        
        # Get product category (defaulting to a standard value if not set)
        category = product.get("category", "ingame_item")
        
        # Determine which currency to use (game currency has priority, then default USD)
        currency_to_use = game_currency or "USD"
        
        # Call Steam API with data from the database
        result = await SteamAPI.init_purchase(
            app_id=steam_app_id,
            order_id=order_id,
            item_id=steam_item_id,
            item_description=product_name,
            category=category,
            steam_id=request.steam_id,
            product_id=request.product_id,
            product_name=product_name,
            amount=price_cents / 100,  # Convert back to dollars for analytics
            currency=currency_to_use,
            quantity=request.quantity
        )
        return result
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error initializing purchase: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error initializing purchase: {str(e)}"
        )




