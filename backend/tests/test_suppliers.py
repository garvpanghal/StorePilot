def test_supplier_crud(client, auth_headers):
    # Create supplier
    resp = client.post(
        "/api/suppliers",
        json={
            "name": "Amul Distributors Bengaluru",
            "contact_person": "Rajesh Kumar",
            "email": "rajesh@amulblr.com",
            "phone": "+91 9988776655",
            "address": "Electronic City, Bengaluru"
        },
        headers=auth_headers
    )
    assert resp.status_code == 201
    sup_id = resp.json()["id"]

    # Get supplier
    get_resp = client.get(f"/api/suppliers/{sup_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "Amul Distributors Bengaluru"
    assert get_resp.json()["product_count"] == 0

    # List suppliers
    list_resp = client.get("/api/suppliers", headers=auth_headers)
    assert len(list_resp.json()) == 1

    # Update supplier
    up_resp = client.put(
        f"/api/suppliers/{sup_id}",
        json={"contact_person": "Rajesh K."},
        headers=auth_headers
    )
    assert up_resp.status_code == 200
    assert up_resp.json()["contact_person"] == "Rajesh K."

    # Delete supplier
    del_resp = client.delete(f"/api/suppliers/{sup_id}", headers=auth_headers)
    assert del_resp.status_code == 204
