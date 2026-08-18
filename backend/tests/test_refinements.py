import pytest

def get_user_b_headers(client):
    # Register second user
    reg_resp = client.post(
        "/api/auth/register",
        json={
            "email": "userb@storepilot.com",
            "full_name": "User B",
            "phone": "+918888888888",
            "shop_name": "Store B",
            "business_type": "Retail",
            "business_address": "Address B",
            "password": "userbpass123",
            "confirm_password": "userbpass123"
        }
    )
    assert reg_resp.status_code == 201
    
    # Login second user
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "userb@storepilot.com", "password": "userbpass123"}
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_category_crud_and_isolation(client, auth_headers):
    # 1. Create category for User A
    create_resp = client.post(
        "/api/categories",
        json={"name": "Electronics", "description": "Devices and gadgets"},
        headers=auth_headers
    )
    assert create_resp.status_code == 201
    cat_id = create_resp.json()["id"]
    
    # 2. Verify in list for User A
    list_a = client.get("/api/categories", headers=auth_headers).json()
    assert any(c["id"] == cat_id and c["name"] == "Electronics" for c in list_a)
    
    # 3. Verify User B does not see it
    headers_b = get_user_b_headers(client)
    list_b = client.get("/api/categories", headers=headers_b).json()
    assert not any(c["id"] == cat_id for c in list_b)
    
    # 4. Try updating User A's category as User B (Should fail/404)
    update_b = client.put(f"/api/categories/{cat_id}", json={"name": "Gizmos"}, headers=headers_b)
    assert update_b.status_code == 404
    
    # 5. Update category as User A
    update_a = client.put(f"/api/categories/{cat_id}", json={"name": "Gadgets"}, headers=auth_headers)
    assert update_a.status_code == 200
    assert update_a.json()["name"] == "Gadgets"
    
    # 6. Setup product in category for deletion check
    prod_resp = client.post(
        "/api/products",
        json={
            "name": "Smartphone",
            "sku": "PHONE-1",
            "selling_price": 15000.0,
            "cost_price": 12000.0,
            "current_stock": 5,
            "reorder_level": 2,
            "category_id": cat_id
        },
        headers=auth_headers
    )
    assert prod_resp.status_code == 201
    
    # 7. Try deleting category that has products (Should fail/400)
    del_fail = client.delete(f"/api/categories/{cat_id}", headers=auth_headers)
    assert del_fail.status_code == 400
    assert "currently used by" in del_fail.json()["detail"]
    
    # 8. Try deleting User A's category as User B (Should fail/404)
    del_b = client.delete(f"/api/categories/{cat_id}", headers=headers_b)
    assert del_b.status_code == 404
    
    # 9. Clean product and delete category as User A (Should pass)
    # Delete the product first
    prod_id = prod_resp.json()["id"]
    client.delete(f"/api/products/{prod_id}", headers=auth_headers)
    
    del_a = client.delete(f"/api/categories/{cat_id}", headers=auth_headers)
    assert del_a.status_code == 200


def test_sale_deletion_and_stock_reversal(client, auth_headers):
    # 1. Setup product with stock = 10
    prod_resp = client.post(
        "/api/products",
        json={
            "name": "Logitech Mouse",
            "sku": "LOGI-MS",
            "selling_price": 800.0,
            "cost_price": 600.0,
            "current_stock": 10,
            "reorder_level": 3
        },
        headers=auth_headers
    )
    prod_id = prod_resp.json()["id"]
    
    # 2. Record sale of 3 units (stock drops to 7)
    sale_resp = client.post(
        "/api/sales",
        json={
            "customer_name": "Aman",
            "payment_method": "Cash",
            "items": [{"product_id": prod_id, "quantity": 3, "unit_price": 800.0}]
        },
        headers=auth_headers
    )
    assert sale_resp.status_code == 201
    sale_id = sale_resp.json()["id"]
    
    # Verify stock is 7
    p_after_sale = client.get(f"/api/products/{prod_id}", headers=auth_headers).json()
    assert p_after_sale["current_stock"] == 7
    
    # 3. Attempt to delete sale as User B (Should fail/404)
    headers_b = get_user_b_headers(client)
    del_b = client.delete(f"/api/sales/{sale_id}", headers=headers_b)
    assert del_b.status_code == 404
    
    # 4. Delete sale as User A (Should succeed and stock returns to 10)
    del_a = client.delete(f"/api/sales/{sale_id}", headers=auth_headers)
    assert del_a.status_code == 200
    
    p_after_del = client.get(f"/api/products/{prod_id}", headers=auth_headers).json()
    assert p_after_del["current_stock"] == 10


def test_purchase_deletion_and_stock_reversal(client, auth_headers):
    # 1. Setup supplier
    sup_resp = client.post(
        "/api/suppliers",
        json={"name": "Tata Coffee Wholesale"},
        headers=auth_headers
    )
    sup_id = sup_resp.json()["id"]
    
    # 2. Setup product with stock = 10
    prod_resp = client.post(
        "/api/products",
        json={
            "name": "Tata Coffee Premium 50g",
            "sku": "TATA-COFFEE-50",
            "selling_price": 180.0,
            "cost_price": 140.0,
            "current_stock": 10,
            "reorder_level": 3
        },
        headers=auth_headers
    )
    prod_id = prod_resp.json()["id"]
    
    # 3. Record purchase of 20 units (stock increases to 30)
    pur_resp = client.post(
        "/api/purchases",
        json={
            "supplier_id": sup_id,
            "items": [{"product_id": prod_id, "quantity": 20, "unit_cost": 140.0}]
        },
        headers=auth_headers
    )
    assert pur_resp.status_code == 201
    pur_id = pur_resp.json()["id"]
    
    # Verify stock is 30
    p_after_pur = client.get(f"/api/products/{prod_id}", headers=auth_headers).json()
    assert p_after_pur["current_stock"] == 30
    
    # 4. Attempt to delete purchase as User B (Should fail/404)
    headers_b = get_user_b_headers(client)
    del_b = client.delete(f"/api/purchases/{pur_id}", headers=headers_b)
    assert del_b.status_code == 404
    
    # 5. Delete purchase as User A (Should succeed and stock returns to 10)
    del_a = client.delete(f"/api/purchases/{pur_id}", headers=auth_headers)
    assert del_a.status_code == 200
    
    p_after_del = client.get(f"/api/products/{prod_id}", headers=auth_headers).json()
    assert p_after_del["current_stock"] == 10
