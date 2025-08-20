# from app.models import Order, Trade
# from sqlalchemy.orm import Session

# def match_order(new_order: Order, db: Session):
#     """
#     Match an order. For now handles only MARKET orders.
#     """

#     # ✅ Check if it's a MARKET order
#     if new_order.type != "M":
#         return  # ignore for now (later we add limit order logic)

#     # Market Buy → match best SELLs
#     if new_order.side == "B":
#         opposite_orders = db.query(Order).filter(
#             Order.symbol_id == new_order.symbol_id,
#             Order.side == "S",
#             Order.type == "L",
#             Order.status.in_(["pending", "partially_filled"])
#         ).order_by(Order.price.asc(), Order.timestamp.asc()).all()
#     else:  # Market Sell → match best BUYs
#         opposite_orders = db.query(Order).filter(
#             Order.symbol_id == new_order.symbol_id,
#             Order.side == "B",
#             Order.type == "L",
#             Order.status.in_(["pending", "partially_filled"])
#         ).order_by(Order.price.desc(), Order.timestamp.asc()).all()

#     remaining_qty = new_order.quantity

#     for o in opposite_orders:
#         if remaining_qty <= 0:
#             break

#         available_qty = o.quantity - o.exec_qty
#         if available_qty <= 0:
#             continue

#         fill_qty = min(remaining_qty, available_qty)
#         trade_price = o.price  # Market executes at counterparty's price

#         # Create Trade record
#         trade = Trade(
#             buy_order_id=new_order.id if new_order.side == "B" else o.id,
#             buy_user_id=new_order.user_id if new_order.side == "B" else o.user_id,
#             sell_order_id=new_order.id if new_order.side == "S" else o.id,
#             sell_user_id=new_order.user_id if new_order.side == "S" else o.user_id,
#             symbol_id=new_order.symbol_id,
#             ticker=new_order.ticker,
#             trade_price=trade_price,
#             trade_quantity=fill_qty,
#         )
#         db.add(trade)

#         # Update counterparty order
#         o.exec_qty += fill_qty
#         if o.exec_qty == o.quantity:
#             o.status = "filled"
#         else:
#             o.status = "partially_filled"

#         # Reduce remaining qty
#         remaining_qty -= fill_qty

#     # Update new order
#     new_order.exec_qty = new_order.quantity - remaining_qty
#     if remaining_qty == 0:
#         new_order.status = "filled"
#     elif new_order.exec_qty > 0:
#         new_order.status = "partially_filled"
#     else:
#         new_order.status = "pending"  # no liquidity

#     db.commit()



from app.models import Order, Trade
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc

def match_order(new_order: Order, db: Session):
    """
    Match incoming order (supports MARKET and LIMIT).
    """

    remaining_qty = new_order.quantity

    # 🔹 If it's a BUY order, look for SELLs
    if new_order.side == "B":
        # Market BUY → best sell (lowest ask)
        # Limit BUY → best sells where price <= my price
        query = db.query(Order).filter(
            Order.symbol_id == new_order.symbol_id,
            Order.side == "S",
            Order.type == "L",
            Order.status.in_(["pending", "partially_filled"])
        ).order_by(asc(Order.price), asc(Order.timestamp))

        if new_order.type == "L":
            query = query.filter(Order.price <= new_order.price)

        opposite_orders = query.all()

    else:  # 🔹 If it's a SELL order, look for BUYs
        query = db.query(Order).filter(
            Order.symbol_id == new_order.symbol_id,
            Order.side == "B",
            Order.type == "L",
            Order.status.in_(["pending", "partially_filled"])
        ).order_by(desc(Order.price), asc(Order.timestamp))

        if new_order.type == "L":
            query = query.filter(Order.price >= new_order.price)

        opposite_orders = query.all()

    # No liquidity found → leave order pending
    if not opposite_orders:
        db.commit()
        return

    for o in opposite_orders:
        if remaining_qty <= 0:
            break

        available_qty = o.quantity - o.exec_qty
        if available_qty <= 0:
            continue

        # fill amount
        fill_qty = min(remaining_qty, available_qty)

        # 🔹 Market executes at counterparty’s price
        # 🔹 Limit executes at counterparty’s price as well (price-time priority)
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
        if o.exec_qty == o.quantity:
            o.status = "filled"
        else:
            o.status = "partially_filled"

        # Update new order progress
        remaining_qty -= fill_qty

    # 🔹 Update new order status
    new_order.exec_qty = new_order.quantity - remaining_qty
    if remaining_qty == 0:
        new_order.status = "filled"
    elif new_order.exec_qty > 0:
        new_order.status = "partially_filled"
    else:
        new_order.status = "pending"

    db.commit()
