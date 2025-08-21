import asyncio
from typing import Dict, List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Order, Trade

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        # {symbol_id: [WebSocket, ...]}
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, symbol_id: int):
        await websocket.accept()
        self.active_connections.setdefault(symbol_id, []).append(websocket)

    def disconnect(self, websocket: WebSocket):
        for conns in self.active_connections.values():
            if websocket in conns:
                conns.remove(websocket)

    async def broadcast(self, symbol_id: int, message: dict):
        for connection in self.active_connections.get(symbol_id, []):
            await connection.send_json(message)


manager = ConnectionManager()


def get_ltp(db: Session, symbol_id: int):
    trade = (
        db.query(Trade)
        .filter(Trade.symbol_id == symbol_id)
        .order_by(Trade.timestamp.desc())
        .first()
    )
    if trade:
        # return {"price": trade.price, "quantity": trade.quantity, "timestamp": trade.timestamp}
        return trade.trade_price
    return None


async def get_order_book(db: Session, symbol_id: int):
    # Aggregate bids
    bids = (
        db.query(
            Order.price, func.sum(Order.quantity - Order.exec_qty).label("quantity")
        )
        .filter(
            Order.symbol_id == symbol_id,
            Order.side == "B",
            Order.type == "L",
            Order.status.in_(["pending", "partially_filled"]),
        )
        .group_by(Order.price)
        .order_by(Order.price.desc())
        .all()
    )

    # Aggregate asks
    asks = (
        db.query(
            Order.price, func.sum(Order.quantity - Order.exec_qty).label("quantity")
        )
        .filter(
            Order.symbol_id == symbol_id,
            Order.side == "S",
            Order.type == "L",
            Order.status.in_(["pending", "partially_filled"]),
        )
        .group_by(Order.price)
        .order_by(Order.price.asc())
        .all()
    )

    order_book = {
        "bids": [
            {"price": b.price, "quantity": b.quantity} for b in bids[:5]
        ],  # top 5 bids
        "asks": [
            {"price": a.price, "quantity": a.quantity} for a in asks[:5]
        ],  # top 5 asks
    }

    return order_book


async def update_order_book(symbol_ids: List[int]):
    while True:
        db = SessionLocal()
        try:
            for symbol_id in symbol_ids:
                order_book = await get_order_book(db, symbol_id)
                ltp = get_ltp(db, symbol_id)
                await manager.broadcast(
                    symbol_id,
                    {"symbol_id": symbol_id, "order_book": order_book, "ltp": ltp},
                )
        finally:
            db.close()
        await asyncio.sleep(2)


@router.websocket("/ws/orderbook/{symbol_id}")
async def websocket_endpoint(websocket: WebSocket, symbol_id: int):
    await manager.connect(websocket, symbol_id)
    db = SessionLocal()
    try:
        # Send initial order book once
        order_book = await get_order_book(db, symbol_id)
        ltp = get_ltp(db, symbol_id)
        await websocket.send_json(
            {"symbol_id": symbol_id, "order_book": order_book, "ltp": ltp}
        )

        while True:
            await websocket.receive_text()  # keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    finally:
        db.close()



@router.get("/ws/orderbook/{symbol_id}", tags=["WebSocket"])
async def ws_orderbook_docs(symbol_id: int):
    """
    Summary:
        Order Book WebSocket Stream (Documentation Only)

    Description:
        This endpoint is for **documentation purposes only**.  
        The actual connection must be made using **WebSocket**:

        ```
        wss://<your-server>/ws/orderbook/{symbol_id}
        ```

        Once connected:
        - The server will immediately send the latest **order book** and **last traded price (LTP)**.  
        - Updates will then be broadcasted every **2 seconds**.  
        - You can send any small message (like `"ping"`) to keep the connection alive.  

        ### Response Format:
        ```json
        {
            "symbol_id": 1,
            "order_book": {
                "bids": [
                    {"price": 101.5, "quantity": 50},
                    {"price": 101.0, "quantity": 30}
                ],
                "asks": [
                    {"price": 102.0, "quantity": 40},
                    {"price": 102.5, "quantity": 25}
                ]
            },
            "ltp": 101.75
        }
        ```

        ### Notes:
        - `bids` → top 5 buy orders, sorted by **highest price first**  
        - `asks` → top 5 sell orders, sorted by **lowest price first**  
        - `ltp` → last traded price for the symbol  
    """
    return {
        "note": "This is documentation only. Use WebSocket at ws://<your-server>/ws/orderbook/{symbol_id}"
    }
