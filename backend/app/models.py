from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from .database import Base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="trader")

    orders = relationship("Order", back_populates="user")
    buy_trades = relationship("Trade", foreign_keys="Trade.buy_user_id", back_populates="buyer")
    sell_trades = relationship("Trade", foreign_keys="Trade.sell_user_id", back_populates="seller")


class Symbol(Base):
    __tablename__ = "symbols"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)

    orders = relationship("Order", back_populates="symbol")
    trades = relationship("Trade", back_populates="symbol")


# Order status enum
class OrderStatus(str, enum.Enum):
    pending = "pending"
    filled = "filled"
    cancelled = "cancelled"
    partially_filled = "partially_filled"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    symbol_id = Column(Integer, ForeignKey("symbols.id", ondelete="CASCADE"))  # ✅ link to Symbol
    ticker = Column(String, index=True, nullable=False)
    side = Column(String)  # "buy" or "sell"
    quantity = Column(Integer)
    price = Column(Float)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    type = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    buy_trades = relationship("Trade", foreign_keys="Trade.buy_order_id", back_populates="buy_order")
    sell_trades = relationship("Trade", foreign_keys="Trade.sell_order_id", back_populates="sell_order")
    symbol = relationship("Symbol")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.symbol and not self.ticker:
            self.ticker = self.symbol.ticker

class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    buy_order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"))
    buy_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    sell_order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"))
    sell_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    symbol_id = Column(Integer, ForeignKey("symbols.id", ondelete="CASCADE"))
    ticker = Column(String, index=True, nullable=False)
    trade_price = Column(Float)
    trade_quantity = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

    buyer = relationship("User", foreign_keys=[buy_user_id], back_populates="buy_trades")
    seller = relationship("User", foreign_keys=[sell_user_id], back_populates="sell_trades")
    buy_order = relationship("Order", foreign_keys=[buy_order_id], back_populates="buy_trades")
    sell_order = relationship("Order", foreign_keys=[sell_order_id], back_populates="sell_trades")
    symbol = relationship("Symbol")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.symbol and not self.ticker:
            self.ticker = self.symbol.ticker


