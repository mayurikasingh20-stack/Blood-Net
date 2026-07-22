"""
Import fresh eRaktkosh blood bank data from static JSON into the database.

Usage:  python import_eraktkosh_blood_banks.py
"""

import os
import sys
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "Backend"))

from app import create_app
from app.extensions import db
from app.models.public_blood_bank import PublicBloodBank

JSON_PATH = os.path.join(os.path.dirname(__file__), "dataset", "eraktkosh_blood_banks.json")

MAPPING = {
    "name": "name",
    "address": "address",
    "phone": "phone",
    "email": "email",
    "facility": "facility",
    "hospitalType": "hospital_type",
    "hospitalCode": "hospital_code",
    "latitude": "latitude",
    "longitude": "longitude",
    "campSource": "camp_source",
    "stockSource": "stock_source",
    "distId": "dist_id",
    "stateCode": "state_code",
    "type": "type",
    "dist": "dist",
}

app = create_app()

with app.app_context():
    with open(JSON_PATH, encoding="utf-8") as f:
        records = json.load(f)

    print(f"Loaded {len(records)} records from JSON")

    imported = 0
    skipped = 0
    updated = 0

    for item in records:
        hospital_code = item.get("hospitalCode")
        if not hospital_code:
            skipped += 1
            continue

        existing = PublicBloodBank.query.filter_by(
            hospital_code=hospital_code
        ).first()

        if existing:
            for src_key, dst_key in MAPPING.items():
                val = item.get(src_key)
                if val is not None:
                    setattr(existing, dst_key, val)
            updated += 1
        else:
            record = PublicBloodBank()
            for src_key, dst_key in MAPPING.items():
                val = item.get(src_key)
                if val is not None:
                    setattr(record, dst_key, val)
            db.session.add(record)
            imported += 1

    db.session.commit()
    total = PublicBloodBank.query.count()
    print(f"Imported: {imported}")
    print(f"Updated: {updated}")
    print(f"Skipped (no hospital_code): {skipped}")
    print(f"Total in DB: {total}")
