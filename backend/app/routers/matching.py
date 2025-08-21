from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from app.models import Order, Trade


def match_order(new_order: Order, db: Session):
    """
    Match incoming order (supports MARKET and LIMIT).
    MARKET orders will have remaining quantity canceled if no opposite orders are left.
    """

    remaining_qty = new_order.quantity

    # 🔹 If it's a BUY order, look for SELLs
    if new_order.side == "B":
        query = (
            db.query(Order)
            .filter(
                Order.symbol_id == new_order.symbol_id,
                Order.side == "S",
                Order.type == "L",
                Order.status.in_(["pending", "partially_filled"]),
            )
            .order_by(asc(Order.price), asc(Order.timestamp))
        )
        if new_order.type == "L":
            query = query.filter(Order.price <= new_order.price)

        opposite_orders = query.all()

    else:  # SELL order → look for BUYs
        query = (
            db.query(Order)
            .filter(
                Order.symbol_id == new_order.symbol_id,
                Order.side == "B",
                Order.type == "L",
                Order.status.in_(["pending", "partially_filled"]),
            )
            .order_by(desc(Order.price), asc(Order.timestamp))
        )
        if new_order.type == "L":
            query = query.filter(Order.price >= new_order.price)

        opposite_orders = query.all()

    # 🔹 No liquidity at all
    if not opposite_orders:
        if new_order.type == "M":  # MARKET order → cancel completely
            new_order.status = "cancelled"
            new_order.exec_qty = 0
            db.add(new_order)
            db.commit()
        else:
            db.commit()  # LIMIT order → leave pending
        return

    # 🔹 Match orders
    for o in opposite_orders:
        if remaining_qty <= 0:
            break

        available_qty = o.quantity - o.exec_qty
        if available_qty <= 0:
            continue

        fill_qty = min(remaining_qty, available_qty)
        trade_price = o.price

        # Create trade
        trade = Trade(
            buy_order_id=new_order.id if new_order.side == "B" else o.id,
            buy_user_id=new_order.user_id if new_order.side == "B" else o.user_id,
            sell_order_id=new_order.id if new_order.side == "S" else o.id,
            sell_user_id=new_order.user_id if new_order.side == "S" else o.user_id,
            symbol_id=new_order.symbol_id,
            ticker=new_order.ticker,
            trade_price=trade_price,
            trade_quantity=fill_qty,
        )
        db.add(trade)

        # Update matched order
        o.exec_qty += fill_qty
        o.status = "filled" if o.exec_qty == o.quantity else "partially_filled"

        remaining_qty -= fill_qty

    # 🔹 Update new order status
    new_order.exec_qty = new_order.quantity - remaining_qty

    if remaining_qty == 0:
        new_order.status = "filled"
    elif new_order.type == "M" and remaining_qty > 0:
        # MARKET order partially filled → cancel remaining
        new_order.status = "cancelled"
    elif new_order.exec_qty > 0:
        new_order.status = "partially_filled"
    else:
        new_order.status = "pending"

    db.commit()
