from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import *
from app.schemas import *

from .auth import get_current_user

router = APIRouter(prefix="/trades", tags=["trades"])


# Get all trades (admin/general purpose)
@router.get("/all", response_model=List[TradeResponse])
def get_all_trades(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access all trades",
        )

    trades = db.query(Trade).all()
    return trades


# Get trades of current user
@router.get("/me", response_model=List[TradeResponse])
def get_my_trades(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    trades = (
        db.query(Trade)
        .filter(
            (Trade.buy_user_id == current_user.id)
            | (Trade.sell_user_id == current_user.id)
        )
        .all()
    )
    return trades


# Get trades by symbol
@router.get("/symbol/{symbol_id}", response_model=List[TradeResponse])
def get_trades_by_symbol(symbol_id: int, db: Session = Depends(get_db)):
    trades = db.query(Trade).filter(Trade.symbol_id == symbol_id).all()
    return trades
