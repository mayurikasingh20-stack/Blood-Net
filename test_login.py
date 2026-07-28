import requests, json

base = "http://127.0.0.1:5000/api"

# Try user 30 (already has donor,patient role)
for email in ["vinaypatient@gmail.com", "testdonor999@gmail.com", "testdon100@gmail.com"]:
    r = requests.post(f"{base}/auth/login", json={
        "identifier": email,
        "password": "Vinay@123"
    })
    print(f"{email} (Vinay@123): {r.status_code}", end="")
    try:
        print(f" {r.json()['message'][:60]}")
    except:
        print(f" {r.text[:100]}")

# Try Test@123
for email in ["testdonor999@gmail.com", "testdon100@gmail.com"]:
    r = requests.post(f"{base}/auth/login", json={
        "identifier": email,
        "password": "Test@123"
    })
    print(f"{email} (Test@123): {r.status_code}", end="")
    try:
        print(f" {r.json()['message'][:60]}")
    except:
        print(f" {r.text[:100]}")
