from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import N8nWebhookPayload
from app.models import Expense

router = APIRouter(
    prefix="/api/webhooks",
    tags=["webhooks"]
)

@router.post("/n8n")
def receive_n8n_webhook(payload: N8nWebhookPayload, db: Session = Depends(get_db)):
    # Create a new Expense record with the raw message
    new_expense = Expense(
        telegram_user_id=payload.telegram_user_id,
        raw_message=payload.message_text
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    # Return the reply that n8n will send back to the user
    reply_text = f"Received your message: '{payload.message_text}'. It has been logged in the database!"
    
    return {"reply": reply_text}
