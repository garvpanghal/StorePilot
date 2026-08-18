import pytest
from app.models.user import User
from app.models.store import Store
from app.models.product import Product
from app.models.category import Category
from app.core.security import hash_password

def test_update_profile(client, db, auth_headers):
    # 1. Update personal details
    resp = client.put(
        "/api/users/me",
        json={"full_name": "Updated Name", "email": "test@storepilot.com", "phone": "9876543210"},
        headers=auth_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["full_name"] == "Updated Name"
    assert data["phone"] == "9876543210"

    # 2. Duplicate email check
    # Create another user first
    user2 = User(
        email="other@storepilot.com",
        full_name="Other User",
        hashed_password=hash_password("otherpass123"),
        role="user",
        is_active=True
    )
    db.add(user2)
    db.commit()

    resp_dup = client.put(
        "/api/users/me",
        json={"full_name": "Updated Name", "email": "other@storepilot.com", "phone": "9876543210"},
        headers=auth_headers
    )
    assert resp_dup.status_code == 400
    assert "already exists" in resp_dup.json()["detail"]


def test_change_password(client, auth_headers):
    # Try invalid current password
    resp_fail = client.put(
        "/api/users/me/password",
        json={"current_password": "wrongpassword", "new_password": "newpassword123"},
        headers=auth_headers
    )
    assert resp_fail.status_code == 400

    # Change password successfully
    resp_ok = client.put(
        "/api/users/me/password",
        json={"current_password": "testpass123", "new_password": "newpassword123"},
        headers=auth_headers
    )
    assert resp_ok.status_code == 200
    assert resp_ok.json()["ok"] is True


def test_update_store(client, auth_headers):
    resp = client.put(
        "/api/users/me/store",
        json={
            "name": "Super Store",
            "business_type": "Retail",
            "phone": "9998887776",
            "email": "contact@super.com",
            "address": "456, Cross Road, Delhi"
        },
        headers=auth_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["store"]["name"] == "Super Store"
    assert data["store"]["business_type"] == "Retail"
    assert data["store"]["address"] == "456, Cross Road, Delhi"


def test_delete_account_cascade_and_protection(client, db, auth_headers):
    # 1. Verify last admin protection
    # The default test user has role="admin" and is the only admin in system
    resp_del_fail = client.delete("/api/users/me", headers=auth_headers)
    assert resp_del_fail.status_code == 400
    assert "final administrator account" in resp_del_fail.json()["detail"]

    # Add another admin user so protection is bypassed
    admin2 = User(
        email="admin2@storepilot.com",
        full_name="Second Admin",
        hashed_password=hash_password("adminpass123"),
        role="admin",
        is_active=True
    )
    db.add(admin2)
    db.commit()

    # Now create category & product under the active test user's store
    test_user = db.query(User).filter(User.email == "test@storepilot.com").first()
    store_id = test_user.store_id

    cat = Category(name="Beverages", store_id=store_id)
    db.add(cat)
    db.flush()

    prod = Product(
        name="Soda 300ml",
        sku="SODA-300",
        selling_price=20.0,
        cost_price=15.0,
        current_stock=100,
        reorder_level=10,
        category_id=cat.id,
        store_id=store_id
    )
    db.add(prod)
    db.commit()

    # Verify products and categories exist before deletion
    assert db.query(Product).filter(Product.store_id == store_id).count() == 1
    assert db.query(Category).filter(Category.store_id == store_id).count() == 1

    # Create another unrelated store and product to verify isolation
    store2 = Store(name="Other Store")
    db.add(store2)
    db.flush()

    cat2 = Category(name="Snacks", store_id=store2.id)
    db.add(cat2)
    db.flush()

    prod2 = Product(
        name="Chips 50g",
        sku="CHIP-50G",
        selling_price=10.0,
        cost_price=8.0,
        current_stock=50,
        reorder_level=5,
        category_id=cat2.id,
        store_id=store2.id
    )
    db.add(prod2)
    db.commit()

    assert db.query(Product).filter(Product.store_id == store2.id).count() == 1

    # 2. Perform safe cascade deletion on the test user account
    resp_del = client.delete("/api/users/me", headers=auth_headers)
    assert resp_del.status_code == 200

    # 3. Assert cascade deletions are completed for user's store
    assert db.query(User).filter(User.email == "test@storepilot.com").count() == 0
    assert db.query(Store).filter(Store.id == store_id).count() == 0
    assert db.query(Product).filter(Product.store_id == store_id).count() == 0
    assert db.query(Category).filter(Category.store_id == store_id).count() == 0

    # 4. Assert unrelated store data remains untouched
    assert db.query(Store).filter(Store.id == store2.id).count() == 1
    assert db.query(Product).filter(Product.store_id == store2.id).count() == 1
    assert db.query(Category).filter(Category.store_id == store2.id).count() == 1
