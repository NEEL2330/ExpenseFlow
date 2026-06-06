"""
Ask AI Router – ExpenseFlow
============================
Provides a POST /api/ask-ai endpoint that accepts a user question,
sends it to Groq (LLaMA) with function-calling tools, executes the
requested database queries, and returns the AI's natural language answer.
"""

import os
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from groq import Groq

from app.database import get_db
from app.models import User
from app.ai_tools import TOOL_DEFINITIONS, TOOL_DISPATCH

router = APIRouter(prefix="/api", tags=["ask-ai"])


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class AskAIRequest(BaseModel):
    question: str
    user_id: str  # Telegram user ID or internal user ID


class AskAIResponse(BaseModel):
    answer: str
    tools_used: list[str] = []


# ---------------------------------------------------------------------------
# Resolve user_id to internal DB user ID
# ---------------------------------------------------------------------------

def _resolve_user_id(db: Session, user_id_str: str) -> int:
    """Convert a telegram_id or internal ID string to the internal user.id."""
    if user_id_str.isdigit():
        # Could be internal ID or telegram ID – check both
        user = db.query(User).filter(
            (User.id == int(user_id_str)) | (User.telegram_id == user_id_str)
        ).first()
    else:
        user = db.query(User).filter(User.telegram_id == user_id_str).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user.id


# ---------------------------------------------------------------------------
# Main endpoint
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are ExpenseFlow AI, a friendly and helpful personal finance assistant.

You help users understand their spending habits by answering questions about their expenses.

Rules:
- Always use the available tools to fetch real data before answering.
- Never make up or guess financial numbers. If no data is found, say so clearly.
- Answer the question DIRECTLY. Do NOT use robotic conversational filler like "Based on the transactions fetched..." or "According to the data...".
- Be fully explicit and specific in your answers. Do NOT assume the user knows what you are thinking.
- Instead of saying "both transactions are the same", explicitly name the dates, amounts, and details so the user is never confused.
- Format currency amounts nicely (e.g., ₹1,500 instead of 1500.0).
- Keep responses concise but insightful – add brief observations when relevant.
- If the user asks something unrelated to expenses, politely redirect them.
- Use emojis sparingly to make responses friendly (💰📊📈).
- When comparing periods, calculate the percentage change.
- Today's date context will be provided in the user message.
"""


@router.post("/ask-ai", response_model=AskAIResponse)
def ask_ai(request: AskAIRequest, db: Session = Depends(get_db)):
    """
    Accept a user's natural language question, use Groq with function calling
    to fetch the relevant data, and return the AI's answer.
    """
    api_key = os.getenv("LLM_API_KEY")
    if not api_key or api_key == "your-api-key-here":
        raise HTTPException(
            status_code=500,
            detail="LLM_API_KEY is not configured. Please set it in your .env file."
        )

    # Resolve user
    internal_user_id = _resolve_user_id(db, request.user_id)

    # Build Groq client
    client = Groq(api_key=api_key)

    # Add date context to the user's question
    today = datetime.now().strftime("%Y-%m-%d")
    user_message = f"[Today's date is {today}]\n\nUser question: {request.question}"

    # Build conversation messages
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    tools_used = []
    max_rounds = 5  # Safety limit to prevent infinite loops

    for _ in range(max_rounds):
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages,
                tools=TOOL_DEFINITIONS,
                tool_choice="auto",
                temperature=0.3,
                max_tokens=1024,
            )
        except Exception as e:
            error_msg = str(e)
            import traceback
            traceback.print_exc()
            if "429" in error_msg or "rate_limit" in error_msg.lower():
                return AskAIResponse(
                    answer="⚠️ AI rate limit reached. Please try again in a few seconds.",
                    tools_used=tools_used,
                )
            raise HTTPException(status_code=500, detail=f"AI service error: {error_msg}")

        choice = response.choices[0]
        message = choice.message

        # If the model wants to call tools
        if message.tool_calls:
            # Add the assistant's message (with tool calls) to conversation
            messages.append({
                "role": "assistant",
                "content": message.content,
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments,
                        },
                    }
                    for tc in message.tool_calls
                ],
            })

            # Execute each tool call
            for tc in message.tool_calls:
                tool_name = tc.function.name
                try:
                    tool_args = json.loads(tc.function.arguments)
                except json.JSONDecodeError:
                    tool_args = {}

                tools_used.append(tool_name)

                # Execute the tool
                if tool_name in TOOL_DISPATCH:
                    try:
                        result = TOOL_DISPATCH[tool_name](
                            db=db,
                            user_id=internal_user_id,
                            **tool_args,
                        )
                    except Exception as e:
                        import traceback
                        traceback.print_exc()
                        result = {"error": str(e)}
                else:
                    result = {"error": f"Unknown tool: {tool_name}"}

                # Add tool result back to conversation
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "name": tool_name,
                    "content": json.dumps(result, default=str),
                })

            # Mark that tools have been called — next round will force text response
            has_called_tools = True

        else:
            # No tool calls — this is the final text response
            final_answer = message.content or "I couldn't generate a response. Please try again."
            return AskAIResponse(answer=final_answer, tools_used=tools_used)

    # If we hit the max rounds, return whatever we have
    return AskAIResponse(
        answer="I had trouble processing your question. Could you try rephrasing it?",
        tools_used=tools_used,
    )

