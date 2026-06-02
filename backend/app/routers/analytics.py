from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models import Transaction, User
from app.schemas import AnalyticsResponse

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/", response_model=AnalyticsResponse)
def get_analytics(
    user_id: Optional[str] = Query(None, description="Telegram User ID or Internal User ID"),
    from_date: Optional[str] = Query(None, alias="from", description="YYYY-MM-DD"),
    to_date: Optional[str] = Query(None, alias="to", description="YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    
    if user_id:
        if user_id.isdigit():
            query = query.join(User).filter((User.id == int(user_id)) | (User.telegram_id == user_id))
        else:
            query = query.join(User).filter(User.telegram_id == user_id)
            
    if from_date:
        try:
            fd = datetime.strptime(from_date, "%Y-%m-%d")
            query = query.filter(Transaction.created_at >= fd)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid from_date format. Use YYYY-MM-DD")
            
    if to_date:
        try:
            td = datetime.strptime(to_date, "%Y-%m-%d")
            td = td.replace(hour=23, minute=59, second=59)
            query = query.filter(Transaction.created_at <= td)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid to_date format. Use YYYY-MM-DD")

    transactions = query.all()
    
    total_spent = sum(t.amount for t in transactions if t.amount is not None)
    transaction_count = len(transactions)
    
    by_category = {}
    by_mode = {}
    by_month = {}
    
    for t in transactions:
        if t.amount is None:
            continue
            
        # Category breakdown
        cat = t.category or "Uncategorized"
        by_category[cat] = by_category.get(cat, 0) + t.amount
        
        # Payment mode breakdown
        mode = t.payment_mode or "Unknown"
        by_mode[mode] = by_mode.get(mode, 0) + t.amount
        
        # Monthly breakdown
        month_key = t.created_at.strftime("%Y-%m") if t.created_at else "Unknown"
        by_month[month_key] = by_month.get(month_key, 0) + t.amount

    return {
        "total_spent": total_spent,
        "transaction_count": transaction_count,
        "by_category": by_category,
        "by_mode": by_mode,
        "by_month": by_month
    }
