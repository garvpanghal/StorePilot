def test_manual_adjustment(client, auth_headers):
    # Create product
    prod_resp = client.post(
        "/api/products",
        json={
            "name": "Tata Salt 1kg",
            "sku": "TATA-SALT",
            "selling_price": 28.0,
            "cost_price": 20.0,
            "current_stock": 20,
            "reorder_level": 10
        },
        headers=auth_headers
    )
    product_id = prod_resp.json()["id"]

    # Adjust stock down by 12 (results in 8, which is Low Stock)
    adj_resp = client.post(
        "/api/inventory/adjust",
        json={
            "product_id": product_id,
            "quantity": -12,
            "notes": "Spillage adjustment"
        },
        headers=auth_headers
    )
    assert adj_resp.status_code == 201
    
    # Check current product stock
    get_resp = client.get(f"/api/products/{product_id}", headers=auth_headers)
    assert get_resp.json()["current_stock"] == 8
    assert get_resp.json()["stock_status"] == "Low Stock"

    # Verify transaction history
    hist_resp = client.get(f"/api/inventory/history?product_id={product_id}", headers=auth_headers)
    assert hist_resp.status_code == 200
    txns = hist_resp.json()
    assert len(txns) == 1
    assert txns[0]["transaction_type"] == "adjustment"
    assert txns[0]["quantity"] == 12
    assert txns[0]["notes"] == "Spillage adjustment"
