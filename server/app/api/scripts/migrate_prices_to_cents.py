#!/usr/bin/env python3
"""
Migration script to convert product prices from float dollars to integer cents.
This script should be run once to update all existing products in the database.
"""
import asyncio
import logging
from typing import List, Dict, Any

from app.db.mongodb import get_database
from app.core.init_data import setup_logging

logger = logging.getLogger(__name__)

async def get_all_products() -> List[Dict[str, Any]]:
    """Get all products from the database."""
    db = get_database()
    collection = db["products"]
    cursor = collection.find({})
    return await cursor.to_list(length=None)  # Get all products

async def update_product_prices(products: List[Dict[str, Any]]) -> int:
    """
    Update all products to use price_cents instead of price.
    
    Args:
        products: List of product dictionaries from the database
        
    Returns:
        Number of products updated
    """
    db = get_database()
    collection = db["products"]
    updated_count = 0
    
    for product in products:
        # Skip products that already have price_cents set
        if "price_cents" in product and product["price_cents"] is not None:
            continue
            
        # Skip products that don't have a price set
        if "price" not in product or product["price"] is None:
            logger.warning(f"Product {product.get('_id')} has no price field. Skipping.")
            continue
            
        price = product["price"]
        price_cents = int(price * 100)
        
        try:
            result = await collection.update_one(
                {"_id": product["_id"]},
                {"$set": {"price_cents": price_cents}}
            )
            
            if result.modified_count > 0:
                updated_count += 1
                logger.info(f"Updated product {product['_id']}: price ${price:.2f} -> {price_cents} cents")
        except Exception as e:
            logger.error(f"Error updating product {product.get('_id')}: {str(e)}")
    
    return updated_count

async def main():
    """Main migration function."""
    setup_logging()
    logger.info("Starting price migration from dollars to cents")
    
    try:
        # Get all products
        products = await get_all_products()
        logger.info(f"Found {len(products)} products in the database")
        
        # Update product prices
        updated_count = await update_product_prices(products)
        logger.info(f"Successfully updated {updated_count} products")
        
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        raise
    
    logger.info("Price migration complete")

if __name__ == "__main__":
    asyncio.run(main())