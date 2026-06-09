from pydantic import BaseModel, field_validator, ConfigDict
from typing import Optional, Union
from datetime import datetime

class N8nWebhookPayload(BaseModel):
    telegram_user_id: Union[str, int]
    username: Optional[str] = None        # Telegram @handle — may be absent
    first_name: Optional[str] = None      # Telegram first_name — almost always present
    message_text: str
    message_id: Optional[Union[str, int]] = None

    @field_validator("telegram_user_id", "message_id", mode="before")
    @classmethod
    def coerce_to_str(cls, v):
        if v is None:
            return v
        return str(v)

class UserResponse(BaseModel):
    id: int
    telegram_id: Optional[str] = None
    username: Optional[str] = None
    name: Optional[str] = None
    telegram_username: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GenerateLinkTokenResponse(BaseModel):
    token: str
    telegram_link: str

class LinkTelegramRequest(BaseModel):
    token: str
    telegram_id: str
    telegram_username: Optional[str] = None

class LinkStatusResponse(BaseModel):
    linked: bool
    telegram_id: Optional[str] = None
    telegram_username: Optional[str] = None

class RegisterRequest(BaseModel):
    token: str
    username: str
    password: str
    confirm_password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TransactionCreate(BaseModel):
    telegram_user_id: str
    amount: float
    category: str
    payment_mode: str

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    payment_mode: Optional[str] = None
    verified: Optional[bool] = None

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    raw_message: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    payment_mode: Optional[str] = None
    description: Optional[str] = None
    verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AnalyticsResponse(BaseModel):
    total_spent: float
    transaction_count: int
    by_category: dict[str, float]
    by_mode: dict[str, float]
    by_month: dict[str, float]
