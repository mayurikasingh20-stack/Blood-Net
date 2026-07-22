import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "Backend"))

db_path = os.path.join(os.path.dirname(__file__), "Backend", "instance", "bloodnet.db")
if not os.path.exists(db_path):
    print("ERROR: DB not found. Run import_public_blood_banks.py first.")
    sys.exit(1)

from app import create_app
app = create_app()
client = app.test_client()

print("=== 1. List all public blood banks ===")
resp = client.get("/public-blood-banks/")
data = resp.get_json()
print(f"  Status: {resp.status_code}, Count: {len(data.get('blood_banks', []))}")
for b in data.get("blood_banks", []):
    print(f"    - {b['name']}")

print("\n=== 2. Get by ID (id=1) ===")
resp = client.get("/public-blood-banks/1")
data = resp.get_json()
print(f"  Status: {resp.status_code}")
if resp.status_code == 200:
    b = data["blood_bank"]
    print(f"  Name: {b['name']}")
    print(f"  Address: {b['address']}")
    print(f"  Phone: {b['phone']}")
    print(f"  Hospital Type: {b['hospital_type']}")

print("\n=== 3. Search by name ===")
resp = client.get("/public-blood-banks/?search=Jodhpur Blood Centre")
data = resp.get_json()
print(f"  Status: {resp.status_code}, Found: {len(data.get('blood_banks', []))}")
for b in data.get("blood_banks", []):
    print(f"    - {b['name']}")

print("\n=== 4. Filter by state_code ===")
resp = client.get("/public-blood-banks/?state_code=98")
data = resp.get_json()
print(f"  Status: {resp.status_code}, Count: {len(data.get('blood_banks', []))}")

print("\n=== 5. Filter by dist_id ===")
resp = client.get("/public-blood-banks/?dist_id=113")
data = resp.get_json()
print(f"  Status: {resp.status_code}, Count: {len(data.get('blood_banks', []))}")

print("\n=== 6. Get non-existent ===")
resp = client.get("/public-blood-banks/999")
print(f"  Status: {resp.status_code}, Body: {resp.get_json()}")

print("\nALL PUBLIC BLOOD BANK TESTS COMPLETED")
