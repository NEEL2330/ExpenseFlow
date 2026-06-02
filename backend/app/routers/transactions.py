from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import Transaction, User
from app.schemas import TransactionCreate, TransactionUpdate, TransactionResponse

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

@router.post("/", response_model=TransactionResponse, status_code=201)
def create_transaction(txn: TransactionCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.telegram_id == txn.telegram_user_id).first()
    if not user:
        user = User(telegram_id=txn.telegram_user_id)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    new_txn = Transaction(
        user_id=user.id,
        amount=txn.amount,
        category=txn.category,
        payment_mode=txn.payment_mode,
        verified=True
    )
    db.add(new_txn)
    db.commit()
    db.refresh(new_txn)
    return new_txn

@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    user_id: Optional[str] = Query(None, description="Telegram User ID or Internal User ID"),
    category: Optional[str] = None,
    mode: Optional[str] = None,
    from_date: Optional[str] = Query(None, alias="from", description="YYYY-MM-DD"),
    to_date: Optional[str] = Query(None, alias="to", description="YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    
    if user_id:
        if user_id.isdigit():
            # Could be internal ID or telegram ID, checking both
            query = query.join(User).filter((User.id == int(user_id)) | (User.telegram_id == user_id))
        else:
            query = query.join(User).filter(User.telegram_id == user_id)
            
    if category:
        query = query.filter(Transaction.category == category)
        
    if mode:
        query = query.filter(Transaction.payment_mode == mode)
        
    if from_date:
        try:
            fd = datetime.strptime(from_date, "%Y-%m-%d")
            query = query.filter(Transaction.created_at >= fd)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid from_date format. Use YYYY-MM-DD")
            
    if to_date:
        try:
            td = datetime.strptime(to_date, "%Y-%m-%d")
            # to include the whole day
            td = td.replace(hour=23, minute=59, second=59)
            query = query.filter(Transaction.created_at <= td)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid to_date format. Use YYYY-MM-DD")
            
    return query.all()

@router.put("/{id}", response_model=TransactionResponse)
def update_transaction(id: int, txn_update: TransactionUpdate, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    update_data = txn_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(txn, key, value)
        
    db.commit()
    db.refresh(txn)
    return txn

@router.delete("/{id}", status_code=204)
def delete_transaction(id: int, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    db.delete(txn)
    db.commit()
    return None
