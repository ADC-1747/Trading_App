from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from .auth import get_current_user
from app.models import *
from app.schemas import *
from .matching import match_order

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)


# Create a new order
@router.post("/new", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    # Check if the symbol exists
    symbol = db.query(Symbol).filter(Symbol.id == order.symbol_id).first()
    if not symbol:
        raise HTTPException(status_code=404, detail="Symbol not found")
    print("symbol",symbol)

    db_order = Order(
        user_id=current_user.id,
        symbol_id=symbol.id,
        ticker=symbol.ticker,  # auto-fill ticker from symbol
        side=order.side,
        quantity=order.quantity,
        exec_qty=0,
        price=order.price,
        type=order.type
    )

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    match_order(db_order, db)


    return db_order


# Get all orders (for admin or general purpose)
@router.get("/", response_model=List[OrderResponse])
def get_all_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orders = db.query(Order)\
        .options(joinedload(Order.user), joinedload(Order.symbol))\
        .all()
    return orders


# Get current user's orders
@router.get("/me", response_model=List[OrderResponse])
def get_my_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orders = db.query(Order)\
        .filter(Order.user_id == current_user.id)\
        .options(joinedload(Order.user), joinedload(Order.symbol))\
        .all()
    return orders


# Cancel an order
@router.delete("/cancel/{order_id}", response_model=OrderResponse)
def cancel_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != OrderStatus.pending:
        raise HTTPException(status_code=400, detail="Only pending orders can be cancelled")
    
    order.status = OrderStatus.cancelled
    db.commit()
    db.refresh(order)
    return order


@router.get("/symbol/{symbol_id}", response_model=List[OrderResponse])
def get_orders_by_symbol(symbol_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orders = db.query(Order)\
        .filter(Order.symbol_id == symbol_id)\
        .options(joinedload(Order.user), joinedload(Order.symbol))\
        .all()
    return orders


