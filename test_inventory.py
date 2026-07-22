import os, sys, io, json, tempfile, shutil
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "Backend"))

# Clean up old DB so schema reflects model changes
db_path = os.path.join(os.path.dirname(__file__), "Backend", "instance", "bloodnet.db")
if os.path.exists(db_path):
    os.remove(db_path)

from app import create_app
from app.extensions import db

app = create_app()
client = app.test_client()

# ---------- helpers ----------
def json_request(method, url, token=None, data=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return method(url, headers=headers, data=json.dumps(data) if data else None)

# ---------- 1. Register blood-bank user ----------
print("\n=== 1. Register blood-bank user ===")
resp = client.post("/api/auth/register", json={
    "first_name": "Test", "last_name": "Bank", "email": "testbank@example.com",
    "phone": "9999999900", "password": "test1234", "role": "blood_bank",
    "gender": "Male", "dob": "1990-01-01", "city": "TestCity"
})
print(f"  Status: {resp.status_code}, Body: {resp.get_json()}")

# ---------- 2. Login ----------
print("\n=== 2. Login ===")
resp = client.post("/api/auth/login", json={
    "email": "testbank@example.com", "password": "test1234"
})
login_data = resp.get_json()
print(f"  Status: {resp.status_code}, Body: {login_data}")
token = login_data.get("access_token", "")
user_id = login_data.get("user", {}).get("id")
print(f"  Token: {token[:50]}...")

# ---------- 3. Register blood bank profile ----------
print("\n=== 3. Register blood bank profile ===")
from io import BytesIO
data = {
    "facility_name": "Test Blood Bank",
    "license_id": "LIC-TEST-001",
    "contact_person": "John Doe",
    "address": "123 Test St",
    "operating_hours": "9 AM - 5 PM",
    "website": "https://testbank.com",
}
license_file = (BytesIO(b"fake license content"), "license.pdf")
resp = client.post("/blood-bank/register",
    data={**data, "license_document": license_file},
    headers={"Authorization": f"Bearer {token}"},
    content_type="multipart/form-data",
)
print(f"  Status: {resp.status_code}, Body: {resp.get_json()}")

# ---------- helper for JSON requests ----------
def j(method, url, data=None):
    return json_request(method, url, token, data)

# ---------- 4. Add Inventory (new) ----------
print("\n=== 4. Add Inventory (A+ 10 units) ===")
resp = j(client.post, "/inventory/", {
    "blood_group": "A+", "units": 10,
    "collection_date": "2026-07-01", "expiry_date": "2026-10-01"
})
print(f"  Status: {resp.status_code}, Body: {resp.get_json()}")

# ---------- 5. Add same blood group again (should INCREMENT) ----------
print("\n=== 5. Add same blood group again (A+ 5 units - should increment) ===")
resp = j(client.post, "/inventory/", {
    "blood_group": "A+", "units": 5,
    "collection_date": "2026-07-02", "expiry_date": "2026-10-15"
})
print(f"  Status: {resp.status_code}, Body: {resp.get_json()}")

# ---------- 6. Add another blood group ----------
print("\n=== 6. Add O- 3 units ===")
resp = j(client.post, "/inventory/", {
    "blood_group": "O-", "units": 3,
    "collection_date": "2026-07-05", "expiry_date": "2026-11-01"
})
print(f"  Status: {resp.status_code}, Body: {resp.get_json()}")

# ---------- 7. Get All Inventory ----------
print("\n=== 7. Get All Inventory ===")
resp = j(client.get, "/inventory/")
data = resp.get_json()
print(f"  Status: {resp.status_code}, Count: {len(data.get('inventory', []))}")
for item in data.get("inventory", []):
    print(f"    - {item['blood_group']}: {item['units']} units [{item['status']}]")

# ---------- 8. Get Inventory by ID ----------
print("\n=== 8. Get Inventory by ID (id=1) ===")
resp = j(client.get, "/inventory/1")
print(f"  Status: {resp.status_code}, Body: {resp.get_json()}")

# ---------- 9. Update Inventory ----------
print("\n=== 9. Update Inventory (id=1, units -> 20) ===")
resp = j(client.put, "/inventory/1", {"units": 20})
print(f"  Status: {resp.status_code}, Body: {resp.get_json()}")

# verify
resp = j(client.get, "/inventory/1")
print(f"  After update: {resp.get_json()}")

# ---------- 10. Search Inventory ----------
print("\n=== 10. Search Inventory (blood_group=A) ===")
resp = j(client.get, "/inventory/search?blood_group=A")
print(f"  Status: {resp.status_code}, Body: {resp.get_json()}")

# ---------- 11. Filter by status ----------
print("\n=== 11. Filter Inventory (status=AVAILABLE) ===")
resp = j(client.get, "/inventory/filter?status=AVAILABLE")
print(f"  Status: {resp.status_code}, Body: {resp.get_json()}")

# ---------- 12. Delete Inventory ----------
print("\n=== 12. Delete Inventory (id=2) ===")
resp = j(client.delete, "/inventory/2")
print(f"  Status: {resp.status_code}, Body: {resp.get_json()}")

# verify remaining
resp = j(client.get, "/inventory/")
data = resp.get_json()
print(f"  Remaining items: {len(data.get('inventory', []))}")

# ---------- 13. Validation error test ----------
print("\n=== 13. Validation error (missing fields) ===")
resp = j(client.post, "/inventory/", {"blood_group": "invalid"})
print(f"  Status: {resp.status_code}, Body: {resp.get_json()}")

# ---------- 14. 404 test ----------
print("\n=== 14. Get non-existent inventory ===")
resp = j(client.get, "/inventory/999")
print(f"  Status: {resp.status_code}, Body: {resp.get_json()}")

print("\nALL TESTS COMPLETED")
