import enum
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, constr


class UserCreate(BaseModel):
    username: constr(min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: constr(min_length=6)
    role: constr(to_lower=True, pattern="^(trader)$") = "trader"

    class Config:
        schema_extra = {
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "strongpassword123",
                "role": "trader",
            }
        }



class UserLogin(BaseModel):
    username: constr(min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$")
    password: str

    class Config:
        schema_extra = {
            "example": {
                "username": "john_doe",
                "password": "strongpassword123",
            }
        }



class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": 1,
                "username": "john_doe",
                "email": "john@example.com",
                "role": "trader",
            }
        }



class SymbolResponse(BaseModel):
    id: int
    name: str
    ticker: str

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": 1,
                "name": "Stock1",
                "ticker": "stk1",
            }
        }



class OrderStatus(str, enum.Enum):
    pending = "pending"
    filled = "filled"
    cancelled = "cancelled"
    partially_filled = "partially_filled"


class OrderCreate(BaseModel):
    symbol_id: int
    side: constr(to_lower=False, pattern="^(B|S)$")
    quantity: int
    price: float
    type: constr(to_lower=False, pattern="^(M|L)$")

    class Config:
        schema_extra = {
            "example": {
                "symbol_id": 1,
                "side": "B",
                "quantity": 100,
                "price": 150.5,
                "type": "L",
            }
        }



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
        schema_extra = {
            "example": {
                "id": 101,
                "user_id": 1,
                "symbol_id": 1,
                "ticker": "stk1",
                "side": "B",
                "quantity": 100,
                "exec_qty": 50,
                "price": 150.5,
                "status": "partially_filled",
                "type": "L",
                "timestamp": "2025-08-21T10:30:00Z",
            }
        }


class TradeCreate(BaseModel):
    buy_order_id: int
    buy_user_id: int
    sell_order_id: int
    sell_user_id: int
    symbol_id: int
    ticker: str
    trade_price: float
    trade_quantity: float

    class Config:
        schema_extra = {
            "example": {
                "buy_order_id": 101,
                "buy_user_id": 1,
                "sell_order_id": 102,
                "sell_user_id": 2,
                "symbol_id": 1,
                "ticker": "stk1",
                "trade_price": 150.75,
                "trade_quantity": 50,
            }
        }



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
        schema_extra = {
            "example": {
                "id": 5001,
                "buy_order_id": 101,
                "buy_user_id": 1,
                "sell_order_id": 102,
                "sell_user_id": 2,
                "symbol_id": 1,
                "ticker": "stk1",
                "trade_price": 150.75,
                "trade_quantity": 50,
                "timestamp": "2025-08-21T10:31:00Z",
            }
        }
