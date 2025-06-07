"""
Helper functions for exporting data in Steam's required formats
"""
from typing import List, Dict, Any, Optional
import json
from datetime import datetime
import os
from app.core.config import settings

def format_product_for_steam_itemdef(product: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format a product for Steam itemdef.json format.
    
    Args:
        product: Product dictionary from the database
        
    Returns:
        Dictionary formatted according to Steam's itemdef.json requirements
    """
    # Get steam item ID, defaulting to a deterministic value if not set
    item_id = product.get("steam_item_id")
    if not item_id:
        # This should never happen as we auto-generate these, but just in case
        item_id = int(int(product.get("_id", "")[:8], 16) % 1000000)
    
    # Basic required fields
    steam_item = {
        "itemdefid": item_id,
        "name": product.get("name", ""),
        "type": "item",  # Always 'item' for standalone products
        "description": product.get("description", ""),
    }
    
    # Handle price data if available
    if "price_cents" in product and product["price_cents"] is not None:
        # For now only include USD, but can be extended for multiple currencies
        steam_item["price"] = {
            "USD": product["price_cents"]
        }
    
    # Add images if available
    if product.get("icon_url"):
        steam_item["icon_url"] = product["icon_url"]
    
    if product.get("icon_url_large"):
        steam_item["icon_url_large"] = product["icon_url_large"]
    
    # Add Steam marketplace attributes
    steam_item["marketable"] = product.get("marketable", False)
    steam_item["tradable"] = product.get("tradable", False)
    steam_item["store_bundle"] = product.get("store_bundle", False)
    
    # Add quantity if available
    if product.get("quantity"):
        steam_item["quantity"] = product["quantity"]
    
    # Add tags if available
    if product.get("tags"):
        steam_item["tags"] = product["tags"]
    
    if product.get("store_tags"):
        steam_item["store_tags"] = product["store_tags"]
    
    if product.get("store_categories"):
        steam_item["store_categories"] = product["store_categories"]
    
    # Add background color if available
    if product.get("background_color"):
        steam_item["background_color"] = product["background_color"]
    
    # Add any additional metadata from the product
    if "metadata" in product and product["metadata"]:
        # Add any custom fields from metadata directly to the item
        for key, value in product["metadata"].items():
            if key not in steam_item:
                steam_item[key] = value
    
    return steam_item

def generate_itemdef_json(products: List[Dict[str, Any]], app_id: Optional[str] = None) -> str:
    """
    Generate Steam itemdef.json content for a list of products.
    
    Args:
        products: List of product dictionaries from the database
        app_id: Optional Steam App ID to filter products (if None, all products are included)
        
    Returns:
        JSON string in Steam's itemdef.json format
    """
    # Filter products by app_id if provided
    if app_id:
        filtered_products = [p for p in products if p.get("steam_app_id") == app_id]
    else:
        filtered_products = products
    
    # Format each product for Steam
    items_list = []
    for product in filtered_products:
        item_id = product.get("steam_item_id")
        if not item_id:
            continue  # Skip products without steam_item_id
        
        items_list.append(format_product_for_steam_itemdef(product))
    
    # Create the full itemdef structure
    itemdef = {
        "appid": int(app_id) if app_id and app_id.isdigit() else int(os.getenv("STEAM_APP_ID", "123456")),
        "items": items_list,
        "version": datetime.utcnow().strftime("%Y%m%d"),
    }
    
    # Convert to JSON with pretty formatting
    return json.dumps(itemdef, indent=2)