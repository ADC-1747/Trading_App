from fastapi import FastAPI
from . import models
from .database import engine
from .routers import auth, symbols, orders, trades, ws_orderbook
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
import redis.asyncio as redis

# origins = ["http://localhost:3000"]
origins = ["https://localhost:3000"]
# origins = ["*"]



# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()
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
async def start_orderbook_updates():
    import asyncio
    symbol_ids = [1, 2, 3]  # all symbols you want to track
    asyncio.create_task(ws_orderbook.update_order_book(symbol_ids))

@app.on_event("startup")
async def startup():
    r = redis.from_url("redis://redis:6379", encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(r)


@app.get("/")
def root():
    return {"message": "API is running!"}
