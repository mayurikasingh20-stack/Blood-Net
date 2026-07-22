import os
import sys
import csv
import re

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "Backend"))

from app import create_app
from app.extensions import db
from app.models.public_blood_bank import PublicBloodBank

CSV_PATH = r"D:\project\dataset\blood-banks.csv"

app = create_app()

def clean_address(raw):
    if not raw:
        return None
    return re.sub(r'\s+', ' ', raw).strip(', ').strip()

def parse_coord(val):
    if not val:
        return None
    val = val.strip()
    if not val or val in ("0", "0.0"):
        return None
    try:
        return float(val)
    except ValueError:
        return None

with app.app_context():
    imported = 0
    skipped = 0
    errors = 0

    with open(CSV_PATH, encoding="windows-1252") as f:
        reader = csv.DictReader(f)
        reader.fieldnames = [h.strip() for h in reader.fieldnames]
        for row in reader:
            name = row.get("Blood Bank Name", "").strip()
            if not name:
                errors += 1
                continue

            existing = PublicBloodBank.query.filter_by(name=name).first()
            if existing:
                skipped += 1
                continue

            address = clean_address(row.get("Address"))
            if not address:
                address = f"{row.get('City', '').strip()}, {row.get('District', '').strip()}, {row.get('State', '').strip()}"

            contact = row.get("Contact No", "").strip()
            mobile = row.get("Mobile", "").strip()
            phone = ", ".join(filter(None, [contact, mobile])) or None

            email = row.get("Email", "").strip() or None
            category = row.get("Category", "").strip() or None
            website = row.get("Website", "").strip() or None

            lat = parse_coord(row.get("Latitude"))
            lng = parse_coord(row.get("Longitude"))

            bank = PublicBloodBank(
                name=name,
                address=address,
                phone=phone,
                email=email,
                facility=website,
                hospital_type=category,
                latitude=lat,
                longitude=lng,
                type="Blood Bank",
            )
            db.session.add(bank)
            imported += 1

    db.session.commit()
    total = PublicBloodBank.query.count()
    print(f"Imported: {imported}")
    print(f"Skipped (duplicate name): {skipped}")
    print(f"Errors (empty name): {errors}")
    print(f"Total in DB: {total}")
