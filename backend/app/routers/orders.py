from typing import List

import redis.asyncio as redis  # Use redis-py async client
from fastapi import APIRouter, Depends, FastAPI, HTTPException, status
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import *
from app.schemas import *

from .auth import get_current_user
from .matching import match_order

router = APIRouter(prefix="/orders", tags=["orders"])


# Create a new order
@router.post(
    "/new",
    response_model=OrderResponse,
    dependencies=[Depends(RateLimiter(times=2, seconds=15))],
    summary="Create a new order",
    description="Allows an authenticated user to create a **new order**. "
                "The ticker is auto-filled from the selected symbol. "
                "Rate limited to **2 requests every 15 seconds**."
)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # Check if the symbol exists
    symbol = db.query(Symbol).filter(Symbol.id == order.symbol_id).first()
    if not symbol:
        raise HTTPException(status_code=404, detail="Symbol not found")
    print("symbol", symbol)

    db_order = Order(
        user_id=current_user.id,
        symbol_id=symbol.id,
        ticker=symbol.ticker,  # auto-fill ticker from symbol
        side=order.side,
        quantity=order.quantity,
        exec_qty=0,
        price=order.price,
        type=order.type,
    )

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    match_order(db_order, db)

    return db_order


# Get all orders (for admin or general purpose)
@router.get("/all", response_model=List[OrderResponse], summary="Get all orders (admin only)",
    description="Returns a list of **all orders in the system**. "
                "Only users with role `admin` can access this endpoint."
)
def get_all_orders(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access all orders",
        )

    orders = db.query(Order).all()
    return orders


# Get current user's orders
@router.get("/me", response_model=List[OrderResponse], summary="Get my orders",
    description="Fetches all orders that belong to the **currently authenticated user**."
)
def get_my_orders(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .options(joinedload(Order.user), joinedload(Order.symbol))
        .all()
    )
    return orders


# Cancel an order
@router.delete("/cancel/{order_id}", response_model=OrderResponse, summary="Cancel an order",
    description="Cancels an **existing order** by its ID. "
                "Only the order owner can cancel it, and only if its status is **pending**."
)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != OrderStatus.pending:
        raise HTTPException(
            status_code=400, detail="Only pending orders can be cancelled"
        )

    order.status = OrderStatus.cancelled
    db.commit()
    db.refresh(order)
    return order


@router.get("/symbol/{symbol_id}", response_model=List[OrderResponse], summary="Get orders by symbol",
    description="Fetches all orders that are linked to a given **symbol ID**. "
                "Includes related user and symbol details."
)
def get_orders_by_symbol(
    symbol_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    orders = (
        db.query(Order)
        .filter(Order.symbol_id == symbol_id)
        .options(joinedload(Order.user), joinedload(Order.symbol))
        .all()
    )
    return orders
