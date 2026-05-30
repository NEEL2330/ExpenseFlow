from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_webhook():
    payload = {
        "telegram_user_id": "123456789",
        "username": "test_user",
        "message_text": "bought a coffee for $5",
        "message_id": "1"
    }
    response = client.post("/api/webhooks/n8n", json=payload)
    print("Response status:", response.status_code)
    print("Response JSON:", response.json())
    assert response.status_code == 200

if __name__ == "__main__":
    test_webhook()
    print("Test passed successfully!")
