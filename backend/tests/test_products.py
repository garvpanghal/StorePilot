def test_create_product(client, auth_headers):
    # First create a category
    cat_resp = client.post(
        "/api/categories",
        json={"name": "Beverages", "description": "Soft drinks"},
        headers=auth_headers
    )
    assert cat_resp.status_code == 201
    cat_id = cat_resp.json()["id"]

    # Now create product
    prod_resp = client.post(
        "/api/products",
        json={
            "name": "Coca-Cola 500ml",
            "sku": "COKE-500",
            "category_id": cat_id,
            "selling_price": 40.0,
            "cost_price": 30.0,
            "current_stock": 50,
            "reorder_level": 15
        },
        headers=auth_headers
    )
    assert prod_resp.status_code == 201
    data = prod_resp.json()
    assert data["name"] == "Coca-Cola 500ml"
    assert data["sku"] == "COKE-500"
    assert data["stock_status"] == "In Stock"


def test_list_products_filtering(client, auth_headers):
    # Create products
    client.post(
        "/api/products",
        json={
            "name": "Milk 1L",
            "sku": "MILK-1L",
            "selling_price": 60.0,
            "cost_price": 50.0,
            "current_stock": 8,
            "reorder_level": 10
        },
        headers=auth_headers
    )
    
    resp = client.get("/api/products?status=low stock", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) == 1
    assert items[0]["sku"] == "MILK-1L"
    assert items[0]["stock_status"] == "Low Stock"
