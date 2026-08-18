from app.models.notification import Notification


def test_notifications_flow(client, db, auth_headers):
    # 1. Insert test notifications
    from app.models.store import Store
    test_store = db.query(Store).first()
    store_id = test_store.id if test_store else 1

    n1 = Notification(title="Low Stock Alert", message="Product X is running low", type="warning", is_read=False, store_id=store_id)
    n2 = Notification(title="Purchase Completed", message="PO-100 has been received", type="success", is_read=False, store_id=store_id)
    n3 = Notification(title="System Announcement", message="Maintenance scheduled", type="info", is_read=True, store_id=store_id)
    db.add_all([n1, n2, n3])
    db.commit()

    # 2. Get notifications count
    count_resp = client.get("/api/notifications/unread-count", headers=auth_headers)
    assert count_resp.status_code == 200
    assert count_resp.json()["unread"] == 2

    # 3. List notifications
    list_resp = client.get("/api/notifications", headers=auth_headers)
    assert list_resp.status_code == 200
    notifications = list_resp.json()
    assert len(notifications) == 3

    # Refresh objects to get generated IDs
    db.refresh(n1)
    db.refresh(n2)
    db.refresh(n3)

    # 4. Mark n1 as read
    read_resp = client.put(f"/api/notifications/{n1.id}/read", headers=auth_headers)
    assert read_resp.status_code == 200
    assert read_resp.json() == {"ok": True}

    # Verify unread count is now 1
    count_resp = client.get("/api/notifications/unread-count", headers=auth_headers)
    assert count_resp.json()["unread"] == 1

    # 5. Mark all as read
    read_all_resp = client.put("/api/notifications/read-all", headers=auth_headers)
    assert read_all_resp.status_code == 200
    assert read_all_resp.json()["marked"] == 1

    # Verify unread count is now 0
    count_resp = client.get("/api/notifications/unread-count", headers=auth_headers)
    assert count_resp.json()["unread"] == 0

    # 6. Delete individual notification n1
    del_resp = client.delete(f"/api/notifications/{n1.id}", headers=auth_headers)
    assert del_resp.status_code == 200
    assert del_resp.json() == {"ok": True}

    # Verify n1 is deleted (2 notifications remaining)
    list_resp = client.get("/api/notifications", headers=auth_headers)
    assert len(list_resp.json()) == 2
    remaining_ids = [n["id"] for n in list_resp.json()]
    assert n1.id not in remaining_ids

    # 7. Delete not-found notification
    del_fail_resp = client.delete("/api/notifications/99999", headers=auth_headers)
    assert del_fail_resp.status_code == 404

    # 8. Clear all notifications
    clear_all_resp = client.delete("/api/notifications", headers=auth_headers)
    assert clear_all_resp.status_code == 200
    assert clear_all_resp.json()["deleted"] == 2

    # Verify no notifications remain
    list_resp = client.get("/api/notifications", headers=auth_headers)
    assert len(list_resp.json()) == 0
