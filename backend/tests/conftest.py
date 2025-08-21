import pytest
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.main import app
from app.models import Base, User, Symbol, Order, Trade
from app.database import get_db
from app.routers.auth import get_current_user
import redis


# ---------------------------
# Postgres test DB connection
# ---------------------------
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@db:5432/test_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db dependency to use test DB
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db


# ---------------------------
# Pytest fixtures
# ---------------------------
@pytest.fixture(scope="session", autouse=True)
def setup_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def clean_db():
    """Clean DB tables before each test"""
    db = TestingSessionLocal()
    try:
        db.query(Order).delete()
        db.query(Trade).delete()
        db.query(Symbol).delete()
        db.query(User).delete()
        db.commit()
    finally:
        db.close()


# ---------------------------
# Unique user fixture (with override)
# ---------------------------
@pytest.fixture()
def test_user():
    db = TestingSessionLocal()
    try:
        unique_username = "user_" + str(uuid.uuid4())[:8]
        user = User(
            username=unique_username,
            email=f"{unique_username}@example.com",
            hashed_password="fakehash"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Dynamically override get_current_user to return THIS user
        app.dependency_overrides[get_current_user] = lambda: user

        yield user
    finally:
        db.close()


# ---------------------------
# Unique symbol fixture
# ---------------------------
@pytest.fixture()
def test_symbol():
    db = TestingSessionLocal()
    try:
        unique_ticker = "SYM_" + str(uuid.uuid4())[:8]
        symbol = Symbol(ticker=unique_ticker, name=unique_ticker + " name")
        db.add(symbol)
        db.commit()
        db.refresh(symbol)
        yield symbol
    finally:
        db.close()


# ---------------------------
# Clear Redis before each test
# ---------------------------
@pytest.fixture(autouse=True)
def clear_rate_limit():
    r = redis.Redis(host="redis", port=6379)
    r.flushall()
    yield
