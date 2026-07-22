import requests, json, sys

BASE = 'http://127.0.0.1:5000/api'

# 1. Register a new blood bank user
reg = requests.post(f'{BASE}/auth/register', json={
    'first_name': 'Test',
    'last_name': 'Bank',
    'email': 'testbank456@test.com',
    'phone': '+91 99999 77777',
    'password': 'password123',
    'role': 'blood_bank',
    'gender': 'Male',
    'dob': '1990-01-01',
    'city': 'Jaipur'
})
print('REGISTER:', reg.status_code, reg.json().get('message'))

# 2. Login
login = requests.post(f'{BASE}/auth/login', json={
    'email': 'testbank456@test.com',
    'password': 'password123',
    'role': 'blood_bank'
})
print('LOGIN:', login.status_code)
token = login.json().get('access_token')

# 3. Register blood bank profile (no lat/lng sent - relies on geocoding)
if token:
    bb = requests.post(f'{BASE}/blood-bank/register', json={
        'facility_name': 'Jaipur City Blood Center',
        'contact_person': 'Dr. Sharma',
        'address': 'MI Road, Jaipur, Rajasthan 302001',
        'operating_hours': '9:00 AM - 6:00 PM',
        'available_24x7': False
    }, headers={'Authorization': f'Bearer {token}'})
    print('BANK REGISTER:', bb.status_code, bb.json().get('message'))

# 4. Login as admin
admin = requests.post(f'{BASE}/auth/login', json={
    'email': 'iamadmin@gmail.com',
    'password': 'password',
    'role': 'admin'
})
print('ADMIN LOGIN:', admin.status_code)
admin_token = admin.json().get('access_token')

# 5. Find and approve the bank
if admin_token:
    banks = requests.get(f'{BASE}/admin/blood-banks', headers={'Authorization': f'Bearer {admin_token}'})
    print('ALL BANKS:', banks.status_code)
    data = banks.json().get('blood_banks', [])
    target = [b for b in data if b['facility_name'] == 'Jaipur City Blood Center']
    if target:
        bid = target[0]['id']
        print(f'Found bank ID={bid}, status={target[0]["verification_status"]}')
        app = requests.patch(f'{BASE}/admin/blood-banks/{bid}/approve', headers={'Authorization': f'Bearer {admin_token}'})
        print('APPROVE:', app.status_code, app.json().get('message'))
    else:
        print('Bank not found in admin list')
        for b in data:
            print(f'  ID={b["id"]} name={b["facility_name"]} status={b["verification_status"]}')

# 6. Check the profile to see if lat/lng were saved
if token:
    prof = requests.get(f'{BASE}/blood-bank/profile', headers={'Authorization': f'Bearer {token}'})
    print('PROFILE:', prof.status_code)
    pdata = prof.json()
    print(f'  lat={pdata.get("latitude")}, lng={pdata.get("longitude")}')
    print(f'  address={pdata.get("address")}')

# 7. Check map endpoint
map_data = requests.get(f'{BASE}/map/registered-blood-banks')
print('\nMAP ENDPOINT:', map_data.status_code)
banks_on_map = map_data.json()
print(f'Banks on map: {len(banks_on_map)}')
for b in banks_on_map:
    print(f'  name={b["name"]} lat={b["lat"]} lng={b["lng"]}')
