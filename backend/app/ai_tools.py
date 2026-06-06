"""
AI Tools for ExpenseFlow
========================
These are the 5 generic data-fetching functions that an LLM can call
via Function Calling / Tool Use to answer any user question about
their expenses.

Each function:
  - Requires `user_id` (internal DB id) to enforce data isolation.
  - Accepts optional date-range and category filters.
  - Returns plain Python dicts/lists (easily serialisable to JSON).
"""

from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import Transaction


# ---------------------------------------------------------------------------
# Helper: build a base query scoped to a single user + optional date range
# ---------------------------------------------------------------------------

def _base_query(
    db: Session,
    user_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    """
    Returns a SQLAlchemy query on the Transaction table filtered by:
      - user_id  (mandatory – ensures data isolation)
      - start_date / end_date  (optional, format YYYY-MM-DD)
    """
    query = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.amount.isnot(None),
    )

    if start_date:
        sd = datetime.strptime(start_date, "%Y-%m-%d")
        query = query.filter(Transaction.created_at >= sd)

    if end_date:
        ed = datetime.strptime(end_date, "%Y-%m-%d")
        ed = ed.replace(hour=23, minute=59, second=59)
        query = query.filter(Transaction.created_at <= ed)

    return query


# ---------------------------------------------------------------------------
# Tool 1: get_transactions
# ---------------------------------------------------------------------------

def get_transactions(
    db: Session,
    user_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    payment_mode: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    limit: int = 50,
) -> list[dict]:
    """
    Fetch a list of individual transactions with optional filters.

    Use this when the user asks to see specific transactions, e.g.:
      - "Show me all my food expenses last month"
      - "What did I spend using UPI this week?"
      - "List transactions over 500 rupees"

    Parameters
    ----------
    user_id    : int           – Internal user ID (required).
    start_date : str | None    – Start of date range (YYYY-MM-DD).
    end_date   : str | None    – End of date range (YYYY-MM-DD).
    category   : str | None    – Filter by category name (e.g. "Food", "Travel").
    payment_mode : str | None  – Filter by payment mode (e.g. "upi", "cash").
    min_amount : float | None  – Minimum transaction amount.
    max_amount : float | None  – Maximum transaction amount.
    limit      : int           – Max number of rows to return (default 50).

    Returns
    -------
    list[dict] – Each dict has: id, amount, category, payment_mode,
                 description, created_at.
    """
    query = _base_query(db, user_id, start_date, end_date)

    if category and category.strip():
        query = query.filter(Transaction.category.ilike(category))
    if payment_mode and payment_mode.strip():
        query = query.filter(Transaction.payment_mode.ilike(payment_mode))
    if min_amount is not None and str(min_amount).strip():
        try:
            query = query.filter(Transaction.amount >= float(min_amount))
        except ValueError:
            pass
    if max_amount is not None and str(max_amount).strip():
        try:
            query = query.filter(Transaction.amount <= float(max_amount))
        except ValueError:
            pass

    # Safe cast for limit
    try:
        limit_val = int(limit)
    except (ValueError, TypeError):
        limit_val = 50

    rows = query.order_by(Transaction.created_at.desc()).limit(limit_val).all()

    return [
        {
            "id": t.id,
            "amount": t.amount,
            "category": t.category,
            "payment_mode": t.payment_mode,
            "description": t.description,
            "created_at": t.created_at.strftime("%Y-%m-%d %H:%M"),
        }
        for t in rows
    ]


# ---------------------------------------------------------------------------
# Tool 2: get_category_summary
# ---------------------------------------------------------------------------

def get_category_summary(
    db: Session,
    user_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> list[dict]:
    """
    Get total spending broken down by category.

    Use this when the user asks about category-level spending, e.g.:
      - "How much did I spend on each category this month?"
      - "What category am I spending the most on?"
      - "Compare my Food vs Travel spending"

    Returns
    -------
    list[dict] – Each dict has: category, total_amount, transaction_count.
                 Sorted by total_amount descending (highest first).
    """
    query = _base_query(db, user_id, start_date, end_date)

    results = (
        query.with_entities(
            Transaction.category,
            func.sum(Transaction.amount).label("total_amount"),
            func.count(Transaction.id).label("transaction_count"),
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    return [
        {
            "category": row.category or "Uncategorized",
            "total_amount": round(float(row.total_amount), 2),
            "transaction_count": row.transaction_count,
        }
        for row in results
    ]


# ---------------------------------------------------------------------------
# Tool 3: get_spending_trend
# ---------------------------------------------------------------------------

def get_spending_trend(
    db: Session,
    user_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
) -> list[dict]:
    """
    Get month-by-month spending totals to reveal trends over time.

    Use this when the user asks about spending over time, e.g.:
      - "How has my spending changed over the last 6 months?"
      - "Compare my Travel expenses this month vs last month"
      - "Am I spending more or less than before?"

    Parameters
    ----------
    category : str | None – If provided, shows the trend for only this category.

    Returns
    -------
    list[dict] – Each dict has: month (YYYY-MM), total_amount, transaction_count.
                 Sorted chronologically (oldest first).
    """
    query = _base_query(db, user_id, start_date, end_date)

    if category:
        query = query.filter(Transaction.category.ilike(category))

    # Group by year-month using MySQL DATE_FORMAT
    month_expr = func.date_format(Transaction.created_at, "%Y-%m")

    results = (
        query.with_entities(
            month_expr.label("month"),
            func.sum(Transaction.amount).label("total_amount"),
            func.count(Transaction.id).label("transaction_count"),
        )
        .group_by(month_expr)
        .order_by(month_expr.asc())
        .all()
    )

    return [
        {
            "month": row.month,
            "total_amount": round(float(row.total_amount), 2),
            "transaction_count": row.transaction_count,
        }
        for row in results
    ]


# ---------------------------------------------------------------------------
# Tool 4: get_top_expenses
# ---------------------------------------------------------------------------

def get_top_expenses(
    db: Session,
    user_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 5,
) -> list[dict]:
    """
    Get the highest individual expenses, sorted by amount descending.

    Use this when the user asks about their biggest or most expensive
    transactions, e.g.:
      - "What was my biggest expense this month?"
      - "Show me my top 5 most expensive purchases"
      - "What was my largest Travel expense?"

    Returns
    -------
    list[dict] – Each dict has: id, amount, category, payment_mode,
                 description, created_at.  Sorted by amount descending.
    """
    query = _base_query(db, user_id, start_date, end_date)

    if category:
        query = query.filter(Transaction.category.ilike(category))

    rows = query.order_by(Transaction.amount.desc()).limit(limit).all()

    return [
        {
            "id": t.id,
            "amount": t.amount,
            "category": t.category,
            "payment_mode": t.payment_mode,
            "description": t.description,
            "created_at": t.created_at.strftime("%Y-%m-%d %H:%M"),
        }
        for t in rows
    ]


# ---------------------------------------------------------------------------
# Tool 5: get_statistics
# ---------------------------------------------------------------------------

def get_statistics(
    db: Session,
    user_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
) -> dict:
    """
    Get summary statistics for the user's spending.

    Use this when the user asks for an overview or summary, e.g.:
      - "How much have I spent this month in total?"
      - "What is my average daily expense?"
      - "Give me a summary of my spending"

    Returns
    -------
    dict with keys:
      - total_spending    : float – Sum of all matching expenses.
      - average_expense   : float – Mean amount per transaction.
      - highest_expense   : float – Largest single transaction.
      - lowest_expense    : float – Smallest single transaction.
      - transaction_count : int   – Number of matching transactions.
    """
    query = _base_query(db, user_id, start_date, end_date)

    if category:
        query = query.filter(Transaction.category.ilike(category))

    result = query.with_entities(
        func.sum(Transaction.amount).label("total"),
        func.avg(Transaction.amount).label("avg"),
        func.max(Transaction.amount).label("max"),
        func.min(Transaction.amount).label("min"),
        func.count(Transaction.id).label("count"),
    ).first()

    # Handle empty result (no transactions found)
    if result is None or result.count == 0:
        return {
            "total_spending": 0,
            "average_expense": 0,
            "highest_expense": 0,
            "lowest_expense": 0,
            "transaction_count": 0,
        }

    return {
        "total_spending": round(float(result.total or 0), 2),
        "average_expense": round(float(result.avg or 0), 2),
        "highest_expense": round(float(result.max or 0), 2),
        "lowest_expense": round(float(result.min or 0), 2),
        "transaction_count": result.count,
    }


# ---------------------------------------------------------------------------
# Tool definitions for LLM Function Calling
# ---------------------------------------------------------------------------
# This list describes all tools in the JSON schema format that most LLM
# providers (OpenAI, Gemini, Claude) expect.  The `ask_ai` endpoint will
# pass this list to the LLM so it knows what tools are available.
# ---------------------------------------------------------------------------

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "get_transactions",
            "description": "Fetch a list of individual transactions with optional filters for date range, category, payment mode, and amount range. Use when the user wants to see specific transactions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "start_date": {"type": "string", "description": "Start date in YYYY-MM-DD format"},
                    "end_date": {"type": "string", "description": "End date in YYYY-MM-DD format"},
                    "category": {"type": "string", "description": "Category name to filter by (e.g. Food, Travel)"},
                    "payment_mode": {"type": "string", "description": "Payment mode to filter by (e.g. upi, cash, credit card)"},
                    "min_amount": {"type": "string", "description": "Minimum transaction amount (as string, e.g. '100')"},
                    "max_amount": {"type": "string", "description": "Maximum transaction amount (as string, e.g. '5000')"},
                    "limit": {"type": "string", "description": "Max number of transactions to return (as string, e.g. '50')"},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_category_summary",
            "description": "Get total spending broken down by category. Returns each category with its total amount and transaction count. Use when the user asks about category-level spending or comparisons between categories.",
            "parameters": {
                "type": "object",
                "properties": {
                    "start_date": {"type": "string", "description": "Start date in YYYY-MM-DD format"},
                    "end_date": {"type": "string", "description": "End date in YYYY-MM-DD format"},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_spending_trend",
            "description": "Get month-by-month spending totals to show trends over time. Optionally filter by category. Use when the user asks about how their spending has changed over time or wants to compare months.",
            "parameters": {
                "type": "object",
                "properties": {
                    "start_date": {"type": "string", "description": "Start date in YYYY-MM-DD format"},
                    "end_date": {"type": "string", "description": "End date in YYYY-MM-DD format"},
                    "category": {"type": "string", "description": "Category name to filter trend for a specific category"},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_top_expenses",
            "description": "Get the highest individual expenses sorted by amount. Use when the user asks about their biggest or most expensive transactions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "start_date": {"type": "string", "description": "Start date in YYYY-MM-DD format"},
                    "end_date": {"type": "string", "description": "End date in YYYY-MM-DD format"},
                    "category": {"type": "string", "description": "Category name to filter by"},
                    "limit": {"type": "integer", "description": "Number of top expenses to return (default 5)"},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_statistics",
            "description": "Get summary statistics: total spending, average expense, highest expense, lowest expense, and transaction count. Use when the user asks for an overview or summary of their spending.",
            "parameters": {
                "type": "object",
                "properties": {
                    "start_date": {"type": "string", "description": "Start date in YYYY-MM-DD format"},
                    "end_date": {"type": "string", "description": "End date in YYYY-MM-DD format"},
                    "category": {"type": "string", "description": "Category name to filter statistics for"},
                },
                "required": [],
            },
        },
    },
]


# ---------------------------------------------------------------------------
# Dispatcher – maps tool name → Python function
# ---------------------------------------------------------------------------

TOOL_DISPATCH = {
    "get_transactions": get_transactions,
    "get_category_summary": get_category_summary,
    "get_spending_trend": get_spending_trend,
    "get_top_expenses": get_top_expenses,
    "get_statistics": get_statistics,
}
