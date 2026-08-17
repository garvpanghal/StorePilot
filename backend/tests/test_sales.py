def test_sale_stock_reduction(client, auth_headers):
    # Setup product
    prod_resp = client.post(
        "/api/products",
        json={
            "name": "Maggi Noodles 70g",
            "sku": "MAGGI-70",
            "selling_price": 14.0,
            "cost_price": 10.0,
            "current_stock": 100,
            "reorder_level": 20
        },
        headers=auth_headers
    )
    product_id = prod_resp.json()["id"]

    # Sell 5 units
    sale_resp = client.post(
        "/api/sales",
        json={
            "customer_name": "Rajesh Kumar",
            "payment_method": "UPI",
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 5,
                    "unit_price": 14.0
                }
            ]
        },
        headers=auth_headers
    )
    assert sale_resp.status_code == 201
    assert sale_resp.json()["total"] == 70.0
    assert "invoice_number" in sale_resp.json()

    # Verify stock is now 95 (100 - 5)
    get_prod = client.get(f"/api/products/{product_id}", headers=auth_headers)
    assert get_prod.json()["current_stock"] == 95


def test_sale_insufficient_stock(client, auth_headers):
    # Setup product with 3 units
    prod_resp = client.post(
        "/api/products",
        json={
            "name": "Surf Excel 1kg",
            "sku": "SURF-1K",
            "selling_price": 120.0,
            "cost_price": 100.0,
            "current_stock": 3,
            "reorder_level": 5
        },
        headers=auth_headers
    )
    product_id = prod_resp.json()["id"]

    # Try selling 5 units (insufficient stock)
    sale_resp = client.post(
        "/api/sales",
        json={
            "customer_name": "Walk-in Customer",
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 5,
                    "unit_price": 120.0
                }
            ]
        },
        headers=auth_headers
    )
    assert sale_resp.status_code == 400
    assert "Insufficient stock" in sale_resp.json()["detail"]
