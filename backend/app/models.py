from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from app.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id               = Column(Integer, primary_key=True, index=True)
    telegram_user_id = Column(String(50), index=True)
    raw_message      = Column(String(500))
    amount           = Column(Float, nullable=True)
    category         = Column(String(100), nullable=True)
    payment_mode     = Column(String(50), nullable=True)
    description      = Column(String(255), nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow)


class PendingExpense(Base):
    """
    Holds a half-parsed expense while the bot waits for the user
    to pick a category. Automatically expires after 5 minutes.

    States
    ------
    AWAITING_CHOICE          – bot showed the numbered list; waiting for user
                               to reply with a number or 'new'
    AWAITING_CATEGORY_NAME   – user chose 'new'; waiting for them to type the name
    """
    __tablename__ = "pending_expenses"

    id               = Column(Integer, primary_key=True, index=True)
    telegram_user_id = Column(String(50), index=True)
    raw_message      = Column(String(500))
    amount           = Column(Float, nullable=True)
    payment_mode     = Column(String(50), nullable=True)
    description      = Column(String(255), nullable=True)
    # JSON-encoded list of category names shown to the user, e.g. '["Food","Travel"]'
    options          = Column(Text, nullable=True)
    # Conversation state
    state            = Column(String(50), default="AWAITING_CHOICE")
    created_at       = Column(DateTime, default=datetime.utcnow)
    # Row is invalid after this timestamp — hard expiry at 5 minutes
    expires_at       = Column(DateTime, nullable=False)
