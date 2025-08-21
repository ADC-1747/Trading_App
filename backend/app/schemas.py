import enum
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, constr


class UserCreate(BaseModel):
    username: constr(min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: constr(min_length=6)
    role: constr(to_lower=True, pattern="^(trader)$") = "trader"


class UserLogin(BaseModel):
    username: constr(min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$")
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        orm_mode = True


class SymbolResponse(BaseModel):
    id: int
    name: str
    ticker: str

    class Config:
        orm_mode = True


class OrderStatus(str, enum.Enum):
    pending = "pending"
    filled = "filled"
    cancelled = "cancelled"
    partially_filled = "partially_filled"


class OrderCreate(BaseModel):
    symbol_id: int
    # ticker: str
    side: constr(to_lower=False, pattern="^(B|S)$")
    quantity: int
    # exec_qty: int
    price: float
    type: constr(to_lower=False, pattern="^(M|L)$")


class OrderResponse(BaseModel):
    id: int
    user_id: int
    symbol_id: int
    ticker: str
    side: str
    quantity: int
    exec_qty: int
    price: float
    status: OrderStatus
    type: str
    timestamp: datetime

    class Config:
        orm_mode = True


class TradeCreate(BaseModel):
    buy_order_id: int
    buy_user_id: int
    sell_order_id: int
    sell_user_id: int
    symbol_id: int
    ticker: str
    trade_price: float
    trade_quantity: float


class TradeResponse(BaseModel):
    id: int
    buy_order_id: int
    buy_user_id: int
    sell_order_id: int
    sell_user_id: int
    symbol_id: int
    ticker: str
    trade_price: float
    trade_quantity: float
    timestamp: datetime

    class Config:
        orm_mode = True
