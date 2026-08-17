def test_purchase_stock_increase(client, auth_headers):
    # Setup supplier & product
    sup_resp = client.post(
        "/api/suppliers",
        json={"name": "Tata Consumer Wholesale"},
        headers=auth_headers
    )
    sup_id = sup_resp.json()["id"]

    prod_resp = client.post(
        "/api/products",
        json={
            "name": "Tata Tea Premium 250g",
            "sku": "TATA-TEA-250",
            "selling_price": 145.0,
            "cost_price": 110.0,
            "current_stock": 10,
            "reorder_level": 5
        },
        headers=auth_headers
    )
    product_id = prod_resp.json()["id"]

    # Execute purchase (restock 40 units)
    purchase_resp = client.post(
        "/api/purchases",
        json={
            "supplier_id": sup_id,
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 40,
                    "unit_cost": 110.0
                }
            ],
            "notes": "Weekly restock"
        },
        headers=auth_headers
    )
    assert purchase_resp.status_code == 201
    assert purchase_resp.json()["total"] == 4400.0

    # Verify current stock updated (10 + 40 = 50)
    get_prod = client.get(f"/api/products/{product_id}", headers=auth_headers)
    assert get_prod.json()["current_stock"] == 50

    # Verify inventory transaction created
    txns = client.get(f"/api/inventory/history?product_id={product_id}", headers=auth_headers).json()
    assert len(txns) == 1
    assert txns[0]["transaction_type"] == "stock_in"
    assert txns[0]["quantity"] == 40
    assert "Purchase" in txns[0]["notes"]
