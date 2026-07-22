"""
Fetch fresh blood bank data from eRaktkosh public API and save as static JSON.

Usage:  python fetch_eraktkosh_blood_banks.py
Output: dataset/eraktkosh_blood_banks.json

Resumes from last saved state if interrupted.
"""

import requests
import json
import os
import time

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "dataset")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "eraktkosh_blood_banks.json")
STATE_FILE = os.path.join(os.path.dirname(__file__), ".fetch_state.json")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://eraktkosh.mohfw.gov.in/",
}
BASE = "https://eraktkosh.mohfw.gov.in/eraktkoshPortal"

MAX_RETRIES = 3
RETRY_DELAY = 5


def get_master_data():
    r = requests.post(
        f"{BASE}/eraktkosh/master/all",
        headers=HEADERS,
        json={"hospitalCode": 100},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def get_blood_banks(state_code, district_code):
    for attempt in range(MAX_RETRIES):
        try:
            r = requests.get(
                f"{BASE}/eraktkosh/bloodbank/nearest",
                headers=HEADERS,
                params={"stateCode": state_code, "districtCode": district_code},
                timeout=30,
            )
            if r.status_code != 200:
                print(f"  FAILED ({r.status_code}), retrying...")
                time.sleep(RETRY_DELAY * (attempt + 1))
                continue
            return r.json()
        except (requests.ConnectionError, requests.Timeout) as e:
            print(f"  Connection error: {e}, retry {attempt+1}/{MAX_RETRIES}...")
            time.sleep(RETRY_DELAY * (attempt + 1))
    print(f"  GIVING UP after {MAX_RETRIES} retries")
    return []


def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            return json.load(f)
    return {"completed": [], "banks": {}}


def save_state(completed, banks):
    with open(STATE_FILE, "w") as f:
        json.dump({"completed": completed, "banks": banks}, f)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    state = load_state()
    all_banks = {int(k): v for k, v in state.get("banks", {}).items()}
    completed = set(state.get("completed", []))

    print("Fetching master data (states/districts)...")
    master = get_master_data()
    states = master["statesWithDistricts"]
    print(f"  Found {len(states)} states/UTs")
    print(f"  Already completed {len(completed)} districts, have {len(all_banks)} banks")

    for state in states:
        sc = str(state["stateCode"])
        sn = state["stateName"]
        districts = state.get("districts", [])

        for district in districts:
            dc = str(district["districtCode"])
            dn = district["districtName"]
            key = f"{sc}_{dc}"

            if key in completed:
                continue

            print(f"  {sn} > {dn}...", end=" ")
            banks = get_blood_banks(sc, dc)
            print(f"{len(banks)} banks")
            for b in banks:
                hc = b.get("hospitalCode")
                if hc and hc not in all_banks:
                    all_banks[hc] = b

            completed.add(key)
            if len(completed) % 10 == 0:
                save_state(list(completed), all_banks)
            time.sleep(0.5)

    print(f"\nFetched {len(all_banks)} unique blood banks total")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(list(all_banks.values()), f, indent=2, ensure_ascii=False)

    print(f"Saved to {OUTPUT_FILE}")

    if os.path.exists(STATE_FILE):
        os.remove(STATE_FILE)


if __name__ == "__main__":
    main()
