import requests, json

base = "http://127.0.0.1:5000/api"

# Try registering with proper fields for the new multi-role system
r = requests.post(f"{base}/auth/register", json={
    "first_name": "FinalTest",
    "last_name": "Donor",
    "email": "finaltest100@gmail.com",
    "password": "Test@123",
    "phone": "9999999199",
    "gender": "male",
    "dob": "1990-01-01",
    "address": "Test Address, Jodhpur",
    "city": "Jodhpur",
    "blood_group": "A+",
    "weight": 70
})
print(f"REGISTER: {r.status_code}")
try:
    print(json.dumps(r.json(), indent=2)[:300])
except:
    print(r.text[:300])

# Login
r2 = requests.post(f"{base}/auth/login", json={
    "identifier": "finaltest100@gmail.com",
    "password": "Test@123"
})
print(f"\nLOGIN: {r2.status_code}")
try:
    print(json.dumps(r2.json(), indent=2)[:300])
except:
    print(r2.text[:300])

if r2.status_code == 200:
    data = r2.json()
    token = data.get("token") or data.get("access_token")
    
    if token:
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        # First check the profile/dashboard
        r_prof = requests.get(f"{base}/user/dashboard", headers=headers)
        print(f"\nDASHBOARD: {r_prof.status_code}")
        print(r_prof.text[:500])
        
        r_prof2 = requests.get(f"{base}/user/donor-profile", headers=headers)
        print(f"\nDONOR PROFILE: {r_prof2.status_code}")
        print(r_prof2.text[:500])
        
        # Submit screening
        screening = {"answers": [
            {"id": "weight", "answer": "no"}, {"id": "age", "answer": "no"},
            {"id": "illness", "answer": "no"}, {"id": "medication", "answer": "no"},
            {"id": "pregnancy", "answer": "no"}, {"id": "surgery", "answer": "no"},
            {"id": "tattoo", "answer": "no"}, {"id": "travel", "answer": "no"},
            {"id": "disease", "answer": "no"}, {"id": "behavior", "answer": "no"},
            {"id": "vaccination", "answer": "no"}
        ]}
        r_s = requests.post(f"{base}/donor/submit-screening", headers=headers, json=screening)
        print(f"\nSCREENING: {r_s.status_code} {r_s.text[:300]}")
        
        # Get open requests
        r3 = requests.get(f"{base}/blood-request/open", headers=headers)
        print(f"\nOPEN REQUESTS ({r3.status_code}):")
        if r3.status_code == 200:
            reqs = r3.json().get("blood_requests", [])
            print(f"Count: {len(reqs)}")
            for br in reqs[:5]:
                print(f"  ID={br['id']} group={br['blood_group']} hospital={br['hospital']}")
            
            if reqs:
                accept_id = reqs[0]['id']
                r4 = requests.post(f"{base}/donations/accept/{accept_id}", headers=headers)
                print(f"\nACCEPT {accept_id}: {r4.status_code} {r4.text[:300]}")
                
                if r4.status_code in (200, 201):
                    r5 = requests.get(f"{base}/blood-request/open", headers=headers)
                    reqs5 = r5.json().get("blood_requests", [])
                    print(f"\nAFTER ACCEPT - Count: {len(reqs5)}")
                    found = any(br['id'] == accept_id for br in reqs5)
                    print("*** BUG: Still listed!" if found else "OK: Correctly excluded")
                    print("IDs:", [br['id'] for br in reqs5])
                    
                    # Also check my-donations to confirm donation was created
                    r6 = requests.get(f"{base}/donations/my-donations", headers=headers)
                    print(f"\nMY DONATIONS: {r6.status_code} {r6.text[:500]}")
        else:
            print(r3.text[:500])
