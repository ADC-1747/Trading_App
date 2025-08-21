def test_create_order_api(client, test_user, test_symbol):
    response = client.post(
        "/orders/new",
        json={
            "symbol_id": test_symbol.id,
            "ticker": test_symbol.ticker,
            "side": "B",
            "quantity": 5,
            "price": 100,
            "type": "L",
            "status": "pending",
            "exec_qty": 0,
            "user_id": test_user.id,
        },
    )

    print("\n[TEST CREATE ORDER] Status:", response.status_code)
    try:
        print("[TEST CREATE ORDER] Response JSON:", response.json())
    except Exception:
        print("[TEST CREATE ORDER] Raw Response Text:", response.text)

    assert response.status_code == 200
    data = response.json()
    assert data["quantity"] == 5
    assert data["exec_qty"] == 0


def test_rate_limit(client, test_user, test_symbol):
    # Hit the endpoint twice (assuming rate limit = 2 per test)
    for i in range(2):
        resp = client.post(
            "/orders/new",
            json={
                "symbol_id": test_symbol.id,
                "ticker": test_symbol.ticker,
                "side": "B",
                "quantity": 1,
                "price": 10,
                "type": "L",
                "status": "pending",
                "exec_qty": 0,
                "user_id": test_user.id,
            },
        )
        print(f"\n[TEST RATE LIMIT] Request {i+1} → Status:", resp.status_code)
        try:
            print(f"[TEST RATE LIMIT] Request {i+1} → JSON:", resp.json())
        except Exception:
            print(f"[TEST RATE LIMIT] Request {i+1} → Raw Text:", resp.text)

        assert resp.status_code != 429

    # Next request should fail due to rate limiting
    resp = client.post(
        "/orders/new",
        json={
            "symbol_id": test_symbol.id,
            "ticker": test_symbol.ticker,
            "side": "B",
            "quantity": 1,
            "price": 10,
            "type": "L",
            "status": "pending",
            "exec_qty": 0,
            "user_id": test_user.id,
        },
    )

    print(
        "\n[TEST RATE LIMIT] Request 3 (should be blocked) → Status:", resp.status_code
    )
    try:
        print("[TEST RATE LIMIT] Request 3 → JSON:", resp.json())
    except Exception:
        print("[TEST RATE LIMIT] Request 3 → Raw Text:", resp.text)

    assert resp.status_code == 429
