import pytest
from fastapi.testclient import TestClient

from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client

def test_finalize_purchase_success(client, monkeypatch):
    async def mock_verify_api_key(api_key):
        return {}

    async def mock_finalize_purchase(app_id, order_id):
        return {"success": True}

    monkeypatch.setattr("app.api.controllers.steam.verify_api_key", mock_verify_api_key)
    monkeypatch.setattr("app.api.models.steam.SteamAPI.finalize_purchase", mock_finalize_purchase)

    response = client.post("/api/v1/FinalizePurchase", json={"trans_id": "123"}, headers={"x-api-key": "test"})
    assert response.status_code == 200
    assert response.json() == {"success": True}

def test_check_purchase_status_success(client, monkeypatch):
    async def mock_verify_api_key(api_key):
        return {}

    async def mock_check_purchase_status(app_id, order_id, trans_id):
        return {
            "success": True,
            "orderid": "order",
            "transid": trans_id,
            "steamid": "user",
            "status": "completed",
            "currency": "USD",
            "time": "2021-01-01T00:00:00",
            "country": "US",
            "usstate": "CA",
            "items": [],
        }

    monkeypatch.setattr("app.api.controllers.steam.verify_api_key", mock_verify_api_key)
    monkeypatch.setattr("app.api.models.steam.SteamAPI.check_purchase_status", mock_check_purchase_status)

    response = client.post(
        "/api/v1/CheckPurchaseStatus",
        json={"trans_id": "123"},
        headers={"x-api-key": "test"},
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
