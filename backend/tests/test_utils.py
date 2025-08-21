from app.models import Order
from app.routers.matching import match_order
from tests.conftest import TestingSessionLocal

def test_match_order_basic(test_user, test_symbol):
    db = TestingSessionLocal()

    # Create mock buy and sell orders
    buy_order = Order(
        side="B",
        quantity=10,
        price=100,
        exec_qty=0,
        user_id=test_user.id,
        symbol_id=test_symbol.id,
        ticker=test_symbol.ticker,
        type="L"
    )

    sell_order = Order(
        side="S",
        quantity=10,
        price=100,
        exec_qty=0,
        user_id=test_user.id,
        symbol_id=test_symbol.id,
        ticker=test_symbol.ticker,
        type="L"
    )

    db.add_all([buy_order, sell_order])
    db.commit()
    db.refresh(buy_order)
    db.refresh(sell_order)

    # Run matching logic
    match_order(buy_order, db)

    db.refresh(buy_order)
    db.refresh(sell_order)

    # Verify that orders fully executed
    assert buy_order.exec_qty == 10
    assert sell_order.exec_qty == 10
