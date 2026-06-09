import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import distinct

from app.database import get_db
from app.schemas import N8nWebhookPayload
from app.models import Transaction, PendingExpense, User, LinkToken
from app.parser import parse_expense

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

PENDING_EXPIRY_MINUTES = 5


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_success_reply(amount, category, payment_mode, confidence, is_new_category=False) -> str:
    parts = ["✅ Expense logged!"]
    if amount is not None:
        parts.append(f"💰 Amount: {amount}")
    cat_label = f"{category} ✨ (new)" if is_new_category else category
    if category:
        parts.append(f"📂 Category: {cat_label}")
    if payment_mode:
        parts.append(f"💳 Mode: {payment_mode}")
    parts.append(f"📊 Confidence: {confidence}%")
    return "\n".join(parts)


def _get_or_create_user(db: Session, telegram_id: str, username: str = None) -> User:
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        # First time this Telegram user is seen — create a record
        user = User(telegram_id=telegram_id, name=username)
        db.add(user)
        db.commit()
        db.refresh(user)
    elif username and not user.name:
        # User exists but name was NULL — backfill it now
        user.name = username
        db.commit()
    return user


def _save_expense(db: Session, user: User, raw_message: str,
                  amount, category, payment_mode) -> Transaction:
    """Create a Transaction row linked via user_id FK only."""
    expense = Transaction(
        user_id=user.id,
        raw_message=raw_message,
        amount=amount,
        category=category,
        payment_mode=payment_mode,
        verified=True if amount and category and payment_mode else False
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def _get_user_categories(db: Session, user: User) -> list[str]:
    """Fetch distinct categories for this user via user_id FK — no telegram_user_id scan."""
    rows = (
        db.query(distinct(Transaction.category))
        .filter(
            Transaction.user_id == user.id,
            Transaction.category.isnot(None),
        )
        .all()
    )
    return [r[0] for r in rows]


def _get_active_pending(db: Session, telegram_user_id: str):
    """Return the user's pending expense if it still exists and hasn't expired."""
    pending = (
        db.query(PendingExpense)
        .filter(PendingExpense.telegram_user_id == telegram_user_id)
        .order_by(PendingExpense.created_at.desc())
        .first()
    )
    if pending is None:
        return None
    # Check 5-minute expiry
    if datetime.utcnow() > pending.expires_at:
        db.delete(pending)
        db.commit()
        return None
    return pending


# ---------------------------------------------------------------------------
# Main endpoint
# ---------------------------------------------------------------------------

@router.post("/n8n")
def receive_n8n_webhook(payload: N8nWebhookPayload, db: Session = Depends(get_db)):
    telegram_id = str(payload.telegram_user_id)
    text        = payload.message_text.strip()
    
    # ── Handle deep linking `/start <token>` ──
    if text.startswith("/start "):
        link_token_str = text.split(" ", 1)[1].strip()
        if link_token_str:
            token_record = db.query(LinkToken).filter(LinkToken.token == link_token_str).first()
            if token_record and token_record.status == "pending" and datetime.utcnow() <= token_record.expires_at:
                token_record.telegram_id = telegram_id
                token_record.telegram_username = payload.username
                token_record.status = "linked"
                db.commit()
                return {"reply": "✅ Your Telegram account has been linked successfully! Please return to the ExpenseFlow website to complete your registration."}
            else:
                return {"reply": "❌ The link token is invalid or has expired. Please generate a new one from the ExpenseFlow website."}

    # Prefer first_name (always set by Telegram); fall back to @username handle
    display_name = payload.first_name or payload.username

    # ── Upsert user FIRST — single source of truth for identity ──
    user = _get_or_create_user(db, telegram_id, display_name)

    # ── STEP A: Check if this user has a pending expense waiting for input ──
    pending = _get_active_pending(db, telegram_id)

    if pending is not None:

        # ── STATE 1: Bot showed the numbered list; user replies with number / 'new' ──
        if pending.state == "AWAITING_CHOICE":
            options: list[str] = json.loads(pending.options or "[]")

            if text.lower() == "new":
                # User wants a brand new category — ask for its name
                pending.state = "AWAITING_CATEGORY_NAME"
                db.commit()
                return {"reply": "What would you like to name this new category?"}

            elif text.isdigit():
                choice = int(text)
                if 1 <= choice <= len(options):
                    chosen_category = options[choice - 1]
                    # Compute confidence for the final receipt
                    detected = sum([pending.amount is not None,
                                    pending.payment_mode is not None,
                                    True])  # category is now confirmed
                    confidence = round((detected / 3) * 100)
                    _save_expense(db, user, pending.raw_message,
                                  pending.amount, chosen_category,
                                  pending.payment_mode)
                    db.delete(pending)
                    db.commit()
                    return {
                        "reply": _build_success_reply(
                            pending.amount, chosen_category, pending.payment_mode,
                            confidence
                        )
                    }
                else:
                    return {
                        "reply": (
                            f"⚠️ Please reply with a number between 1 and {len(options)}, "
                            f"or reply 'new' to create a new category."
                        )
                    }
            else:
                return {
                    "reply": (
                        "⚠️ I didn't understand that. Reply with a number from the list above, "
                        "or reply 'new' to create a new category."
                    )
                }

        # ── STATE 2: User asked for new category; now they type the name ──
        elif pending.state == "AWAITING_CATEGORY_NAME":
            new_category = text.strip().capitalize()
            if not new_category:
                return {"reply": "Please type a valid category name."}

            detected = sum([pending.amount is not None,
                            pending.payment_mode is not None,
                            True])
            confidence = round((detected / 3) * 100)
            _save_expense(db, user, pending.raw_message,
                          pending.amount, new_category,
                          pending.payment_mode)
            db.delete(pending)
            db.commit()
            return {
                "reply": _build_success_reply(
                    pending.amount, new_category, pending.payment_mode,
                    confidence, is_new_category=True
                )
            }

    # ── STEP B: No pending state — parse as a fresh expense ──
    user_categories = _get_user_categories(db, user)
    parsed = parse_expense(text, user_categories)

    # ── Needs clarification: category couldn't be matched confidently ──
    if parsed["needs_clarification"]:
        # Build the numbered list of ALL user categories
        options = user_categories  # show all existing categories
        numbered = "\n".join(f"{i+1}️⃣ {cat}" for i, cat in enumerate(options))

        # Save pending record
        pending_record = PendingExpense(
            telegram_user_id=telegram_id,
            raw_message=text,
            amount=parsed["amount"],
            payment_mode=parsed["payment_mode"],
            description=parsed["description"],
            options=json.dumps(options),
            state="AWAITING_CHOICE",
            expires_at=datetime.utcnow() + timedelta(minutes=PENDING_EXPIRY_MINUTES),
        )
        db.add(pending_record)
        db.commit()

        return {
            "reply": (
                f"⚠️ Couldn't match '{parsed['raw_category_word']}' to any of your categories.\n\n"
                f"Your existing categories:\n{numbered}\n\n"
                f"Reply with a number to use an existing category,\n"
                f"or reply 'new' to create a new one.\n\n"
                f"_(This request expires in {PENDING_EXPIRY_MINUTES} minutes)_"
            )
        }

    # ── Category was resolved (auto-matched or first-time user) — save directly ──
    _save_expense(db, user, text,
                  parsed["amount"], parsed["category"],
                  parsed["payment_mode"])

    return {
        "reply": _build_success_reply(
            parsed["amount"], parsed["category"], parsed["payment_mode"],
            parsed["confidence"]
        )
    }
