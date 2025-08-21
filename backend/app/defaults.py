from app.models import Symbol, User
from app.database import SessionLocal
from passlib.hash import bcrypt

def create_default_symbols():
    db = SessionLocal()
    try:
        defaults = [
            {"ticker": "stk1", "name": "Stock1"},
            {"ticker": "stk2", "name": "Stock2"},
            {"ticker": "stk3", "name": "Stock3"}
        ]
        for s in defaults:
            exists = db.query(Symbol).filter_by(ticker=s["ticker"]).first()
            if not exists:
                db.add(Symbol(**s))
        db.commit()
    finally:
        db.close()


def create_default_user():
    db = SessionLocal()
    try:
        # Check if user already exists
        user = db.query(User).filter_by(username="admin1").first()
        if not user:
            user = User(
                username="admin1",
                email="admin1@mail.com",
                hashed_password=bcrypt.hash("admin1"),  # hashed password
                role="admin"
            )
            db.add(user)
            db.commit()
    finally:
        db.close()