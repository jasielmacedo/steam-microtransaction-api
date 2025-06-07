import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client


def test_root_endpoint(client):
    """Test the root endpoint returns status true."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": True}