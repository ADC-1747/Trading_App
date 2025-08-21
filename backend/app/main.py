import redis.asyncio as redis
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from .defaults import create_default_symbols, create_default_user

from . import models
from .database import engine, SessionLocal
from .routers import auth, orders, symbols, trades, ws_orderbook

# origins = ["http://localhost:3000"]
origins = ["https://localhost:3000"]
# origins = ["*"]


# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Trading App API",
    description="REST API for handling users, symbols, and orders in the trading system.",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(symbols.router)
app.include_router(orders.router)
app.include_router(trades.router)
app.include_router(ws_orderbook.router)

@app.on_event("startup")
def startup_populate():
    create_default_symbols()
    create_default_user()

@app.on_event("startup")
async def start_orderbook_updates():
    import asyncio

    db = SessionLocal()
    try:
        symbol_ids = [s.id for s in db.query(models.Symbol.id).all()]
    finally:
        db.close()

    asyncio.create_task(ws_orderbook.update_order_book(symbol_ids))


@app.on_event("startup")
async def startup():
    r = redis.from_url("redis://redis:6379", encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(r)



@app.get("/")
def root():
    return {"message": "API is running!"}
