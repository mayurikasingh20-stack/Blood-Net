import requests, re

headers = {"User-Agent": "Mozilla/5.0"}
base = "https://eraktkosh.mohfw.gov.in"

url = "https://eraktkosh.mohfw.gov.in/eraktkoshPortal/static/js/main.e37edfcc.js"
r = requests.get(url, headers=headers, timeout=15)
js = r.text

# Search for API-related function names
patterns = [
    "getAllBB", "listBB", "bbList", "fetchBB", "bloodBankList",
    "getHospital", "hospitalList", "fetchHospital", "getStock",
    "stockAvail", "nearBy", "getAllBlood", "getAllHospital",
    "publicBloodBank", "directoryList", "getDirectory",
    "stateWise", "districtWise", "searchBB",
]
for p in patterns:
    idx = js.find(p)
    if idx >= 0:
        start = max(0, idx - 300)
        end = min(len(js), idx + len(p) + 300)
        context = js[start:end]
        clean = re.sub(r'\s+', ' ', context)
        if len(clean) > 600:
            clean = clean[:600] + "..."
        print(f"\n=== '{p}' at {idx} ===")
        print(clean)
