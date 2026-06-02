from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_webhook_creates_transaction():
    payload = {
        "telegram_user_id": "99999",
        "username": "test_user_99",
        "message_text": "bought a coffee for 50 cash",
        "message_id": "1"
    }
    response = client.post("/api/webhooks/n8n", json=payload)
    assert response.status_code == 200

def test_get_transactions():
    response = client.get("/api/transactions/?user_id=99999")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    txn = data[0]
    assert txn["amount"] == 50.0
    # The parser might parse "bought" as category if categories are empty, but we verify it got created
    assert "id" in txn

def test_analytics():
    response = client.get("/api/analytics/?user_id=99999")
    assert response.status_code == 200
    data = response.json()
    assert data["transaction_count"] >= 1
    assert data["total_spent"] >= 50.0

def test_create_transaction_direct():
    # First get current count
    response = client.get("/api/transactions/?user_id=88888")
    initial_count = len(response.json()) if response.status_code == 200 else 0

    payload = {
        "telegram_user_id": "88888",
        "amount": 100.0,
        "category": "Food",
        "payment_mode": "UPI"
    }
    response = client.post("/api/transactions/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 100.0
    txn_id = data["id"]
    
    # Update it
    update_payload = {
        "category": "Groceries",
        "verified": True
    }
    response = client.put(f"/api/transactions/{txn_id}", json=update_payload)
    assert response.status_code == 200
    assert response.json()["category"] == "Groceries"
    assert response.json()["verified"] == True
    
    # Delete it
    response = client.delete(f"/api/transactions/{txn_id}")
    assert response.status_code == 204
    
    # Verify deletion
    response = client.get("/api/transactions/?user_id=88888")
    assert response.status_code == 200
    assert len(response.json()) == initial_count
