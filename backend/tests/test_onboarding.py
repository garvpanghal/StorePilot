import pytest
from app.models.user import User
from app.models.product import Product

def test_update_onboarding(client, auth_headers):
    # Verify default state (False for new users created in fixtures)
    resp = client.get("/api/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["onboarding_completed"] is False

    # Update onboarding to True
    resp = client.put(
        "/api/users/me/onboarding",
        json={"completed": True},
        headers=auth_headers
    )
    assert resp.status_code == 200
    assert resp.json()["onboarding_completed"] is True

    # Get /auth/me again and check
    resp = client.get("/api/auth/me", headers=auth_headers)
    assert resp.json()["onboarding_completed"] is True

    # Set back to False
    resp = client.put(
        "/api/users/me/onboarding",
        json={"completed": False},
        headers=auth_headers
    )
    assert resp.status_code == 200
    assert resp.json()["onboarding_completed"] is False


def test_get_checklist_status(client, db, auth_headers):
    # Get checklist status
    resp = client.get("/api/users/me/checklist", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "store_setup" in data
    assert "add_product" in data
    assert "add_supplier" in data
    assert "record_purchase" in data
    assert "record_sale" in data

    # Find the current user's store_id
    me_resp = client.get("/api/auth/me", headers=auth_headers)
    store_id = me_resp.json()["store_id"]
    
    # Insert a product to verify checklist derivation updates add_product to True
    product = Product(
        store_id=store_id,
        name="Test Checklist Product",
        sku="CHKL-ONB-1",
        selling_price=10.0,
        cost_price=5.0,
        current_stock=10
    )
    db.add(product)
    db.commit()

    # Re-fetch checklist status and assert
    resp = client.get("/api/users/me/checklist", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["add_product"] is True
