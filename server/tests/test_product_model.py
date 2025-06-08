import pytest
import app.db.sqlite as db
from app.api.models.product import Product

@pytest.mark.asyncio
async def test_create_product_with_steam_app_id(tmp_path):
    await db.connect_to_db()
    async with db.AsyncSessionLocal() as session:
        data = {
            "name": "Test Product",
            "description": "Test Desc",
            "price_cents": 100,
            "type": "Currency",
            "steam_app_id": "123",
        }
        product = await Product.create(session, data)
        assert product.steam_app_id == "123"
        fetched = await Product.get_by_id(session, product.id)
        assert fetched.steam_app_id == "123"
        await Product.delete(session, product.id)

