def test_login_success(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "test@storepilot.com", "password": "testpass123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_password(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "test@storepilot.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_get_current_user_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_get_current_user_authorized(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@storepilot.com"
    assert data["full_name"] == "Test User"


def test_register_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@storepilot.com",
            "full_name": "New Store User",
            "phone": "9876543210",
            "shop_name": "Apex Grocery",
            "business_type": "Grocery",
            "business_address": "Some Address",
            "password": "secretpassword123",
            "confirm_password": "secretpassword123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@storepilot.com"
    assert data["full_name"] == "New Store User"
    assert data["role"] == "user"
    assert "hashed_password" not in data

    # Verify newly created user can log in
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "newuser@storepilot.com", "password": "secretpassword123"},
    )
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()


def test_register_duplicate_email(client):
    # Register first
    client.post(
        "/api/auth/register",
        json={
            "email": "dup@storepilot.com",
            "full_name": "Dup User",
            "phone": "9876543210",
            "shop_name": "Dup Grocery",
            "password": "secretpassword123",
            "confirm_password": "secretpassword123",
        },
    )
    # Attempt to register again
    response = client.post(
        "/api/auth/register",
        json={
            "email": "dup@storepilot.com",
            "full_name": "Another Name",
            "phone": "9876543211",
            "shop_name": "Another Grocery",
            "password": "secretpassword123",
            "confirm_password": "secretpassword123",
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "An account with this email already exists."


def test_register_validation_failures(client):
    # 1. Blank name
    response = client.post(
        "/api/auth/register",
        json={
            "email": "valid@storepilot.com",
            "full_name": "   ",
            "phone": "9876543210",
            "shop_name": "Valid Grocery",
            "password": "secretpassword123",
            "confirm_password": "secretpassword123",
        },
    )
    assert response.status_code == 422

    # 2. Short password
    response = client.post(
        "/api/auth/register",
        json={
            "email": "valid@storepilot.com",
            "full_name": "Valid Name",
            "phone": "9876543210",
            "shop_name": "Valid Grocery",
            "password": "12345",
            "confirm_password": "12345",
        },
    )
    assert response.status_code == 422

    # 3. Passwords mismatch
    response = client.post(
        "/api/auth/register",
        json={
            "email": "valid@storepilot.com",
            "full_name": "Valid Name",
            "phone": "9876543210",
            "shop_name": "Valid Grocery",
            "password": "secretpassword123",
            "confirm_password": "differentpassword",
        },
    )
    assert response.status_code == 422

    # 4. Invalid email format
    response = client.post(
        "/api/auth/register",
        json={
            "email": "invalid-email-format",
            "full_name": "Valid Name",
            "phone": "9876543210",
            "shop_name": "Valid Grocery",
            "password": "secretpassword123",
            "confirm_password": "secretpassword123",
        },
    )
    assert response.status_code == 422

    # 5. Invalid Indian mobile number format
    response = client.post(
        "/api/auth/register",
        json={
            "email": "valid@storepilot.com",
            "full_name": "Valid Name",
            "phone": "123456",
            "shop_name": "Valid Grocery",
            "password": "secretpassword123",
            "confirm_password": "secretpassword123",
        },
    )
    assert response.status_code == 422

    # 6. Blank shop name
    response = client.post(
        "/api/auth/register",
        json={
            "email": "valid@storepilot.com",
            "full_name": "Valid Name",
            "phone": "9876543210",
            "shop_name": "   ",
            "password": "secretpassword123",
            "confirm_password": "secretpassword123",
        },
    )
    assert response.status_code == 422
