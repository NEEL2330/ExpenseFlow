from pydantic import BaseModel, field_validator
from typing import Optional, Union

class N8nWebhookPayload(BaseModel):
    telegram_user_id: Union[str, int]
    username: Optional[str] = None
    message_text: str
    message_id: Optional[Union[str, int]] = None

    @field_validator("telegram_user_id", "message_id", mode="before")
    @classmethod
    def coerce_to_str(cls, v):
        if v is None:
            return v
        return str(v)
