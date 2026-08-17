def test_dashboard_calculations(client, auth_headers):
    # Setup product
    prod_resp = client.post(
        "/api/products",
        json={
            "name": "Coca-Cola 750ml",
            "sku": "COKE-750",
            "selling_price": 45.0,
            "cost_price": 30.0,
            "current_stock": 20,
            "reorder_level": 10
        },
        headers=auth_headers
    )
    product_id = prod_resp.json()["id"]

    # Sell 4 units
    client.post(
        "/api/sales",
        json={
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 4,
                    "unit_price": 45.0
                }
            ]
        },
        headers=auth_headers
    )

    # Fetch dashboard data
    dash_resp = client.get("/api/dashboard?period=30d", headers=auth_headers)
    assert dash_resp.status_code == 200
    data = dash_resp.json()

    # Revenue = 4 * 45 = 180
    assert data["stats"]["total_revenue"] == 180.0
    # Profit = 4 * (45 - 30) = 60
    assert data["stats"]["total_profit"] == 60.0
    assert data["stats"]["total_orders"] == 1
    # Inventory Value = 16 (remaining stock) * 30 (cost price) = 480
    assert data["stats"]["inventory_value"] == 480.0
    assert len(data["recent_sales"]) == 1
    assert data["recent_sales"][0]["total"] == 180.0
