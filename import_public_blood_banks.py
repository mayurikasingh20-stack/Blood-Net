import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "Backend"))

from app import create_app
from app.extensions import db
from app.models.public_blood_bank import PublicBloodBank

app = create_app()

jodhpur_data = [
    {
        "name": "Jiet Medical College And Hospital Blood Centeer",
        "address": "JIET UNIVERSITY CAMPUS NH-62 VILLAGE MOGRA, PALI ROAD, JODHPUR, Dist. Jodhpur",
        "count": 12, "phone": "9251998512",
        "email": "bloodbank.jmch@jietjodhpur.ac.in", "facility": None,
        "hospitalType": "Private", "hospitalCode": 284563,
        "latitude": 26.14877, "longitude": 73.04396,
        "campSource": 2, "stockSource": 2, "distId": 113,
        "stateCode": 98, "type": "Blood Bank", "dist": 10636.94663839054
    },
    {
        "name": "All India Institute of Medical Sciences Jodhpur",
        "address": "AIIMS Jodhpur, Basni Phase 2, Jodhpur, Dist. Jodhpur",
        "count": 12, "phone": "02912740742",
        "email": "tmtm@aiimsjodhpur.edu.in", "facility": None,
        "hospitalType": "Govt.", "hospitalCode": 98108,
        "latitude": 26.24029, "longitude": 73.00508,
        "campSource": 2, "stockSource": 2, "distId": 113,
        "stateCode": 98, "type": "Blood Bank", "dist": 10917.784715080928
    },
    {
        "name": "Medipulse Hospital Jodhpur",
        "address": "Plot No- E-4, M.I.A. Basni, II nd phase, opp AIIMS Campus, Jodhpur, Dist. Jodhpur",
        "count": 12, "phone": "9829006306",
        "email": "info@medipulse.in", "facility": None,
        "hospitalType": "Private", "hospitalCode": 280240,
        "latitude": 26.241, "longitude": 73.0054,
        "campSource": 2, "stockSource": 2, "distId": 113,
        "stateCode": 98, "type": "Blood Bank", "dist": 10999.974049653048
    },
    {
        "name": "Ambika Blood Centre Jodhpur",
        "address": "B-22- 23 Sarswati Nagar Basni Jodhpur, Jodhpur, Dist. Jodhpur",
        "count": 12, "phone": "9414100844,02912721316",
        "email": "doctorsrivastav@yahoo.com", "facility": None,
        "hospitalType": "Private", "hospitalCode": 28080,
        "latitude": 26.23156, "longitude": 73.02102,
        "campSource": 2, "stockSource": 2, "distId": 113,
        "stateCode": 98, "type": "Blood Bank", "dist": 11268.591023960687
    },
    {
        "name": "Mathura Das Mathur Hospital, Jodhpur",
        "address": "Main Road, Sector-C, Shastri Nagar, Jodhpur, Jodhpur, Dist. Jodhpur",
        "count": 12, "phone": "0292624300",
        "email": "supdt.mdmh.ju@gmail.com", "facility": None,
        "hospitalType": "Govt.", "hospitalCode": 28008,
        "latitude": 26.27066, "longitude": 73.01005,
        "campSource": 2, "stockSource": 2, "distId": 113,
        "stateCode": 98, "type": "Blood Bank", "dist": 14001.871305766415
    },
    {
        "name": "Mg Hospital Jodhpur",
        "address": "Jalori Bari Rd, Jaswant Sarai, Ratanada, Jodhpur, Dist. Jodhpur",
        "count": 12, "phone": "2912636901",
        "email": "drrajshreebehra@gmail.com", "facility": None,
        "hospitalType": "Govt.", "hospitalCode": 28006,
        "latitude": 26.27136, "longitude": 73.00883,
        "campSource": 2, "stockSource": 2, "distId": 113,
        "stateCode": 98, "type": "Blood Bank", "dist": 14007.561821863628
    },
    {
        "name": "Paras Blood Center Charitable Trust Jodhpur",
        "address": " 733, 1st C Road, Sardarpura, Jodhpur, Near Mahaveer Complex, Tar Ghar Jodhpur , Jodhpur, Dist. Jodhpur",
        "count": 12, "phone": "9530251816",
        "email": "kanudeviparasmalmehta@gmail.com", "facility": None,
        "hospitalType": "Charitable/Vol", "hospitalCode": 28058,
        "latitude": 26.27777, "longitude": 73.015288,
        "campSource": 2, "stockSource": 2, "distId": 113,
        "stateCode": 98, "type": "Blood Bank", "dist": 14949.40581293116
    },
    {
        "name": "Umaid Hospital",
        "address": "Geeta Bhawan Road, Siwanchi Gate, Jodhpur, Jodhpur, Dist. Jodhpur",
        "count": 12, "phone": "9829091119",
        "email": "umaidbloodbank1603@gmail.com", "facility": None,
        "hospitalType": "Govt.", "hospitalCode": 28009,
        "latitude": 26.2836, "longitude": 73.00813,
        "campSource": 2, "stockSource": 2, "distId": 113,
        "stateCode": 98, "type": "Blood Bank", "dist": 15170.039525234277
    },
    {
        "name": "Rotary Blood Centre Jodhpur",
        "address": "173 E Ground Floor, K.N. Wanchoo Rotary Bhawan, Gaurav Path,, Jodhpur, Dist. Jodhpur",
        "count": 12, "phone": "8824789921",
        "email": "rotarybloodbankjodhpur@gmail.com", "facility": None,
        "hospitalType": "Charitable/Vol", "hospitalCode": 283360,
        "latitude": 26.296772, "longitude": 73.035143,
        "campSource": 2, "stockSource": 2, "distId": 113,
        "stateCode": 98, "type": "Blood Bank", "dist": 17792.18867553085
    },
    {
        "name": "Vyas Blood Centre Super Speciality Hospital",
        "address": "vyas medicity, kudi haud pali road, Jodhpur, Dist. Jodhpur",
        "count": 12, "phone": "9166597555",
        "email": "bloodcentre@vyasmedicity.com", "facility": None,
        "hospitalType": "Private", "hospitalCode": 284406,
        "latitude": 26.296772, "longitude": 73.035143,
        "campSource": 2, "stockSource": 2, "distId": 113,
        "stateCode": 98, "type": "Blood Bank", "dist": 17792.18867553085
    },
    {
        "name": "Raj Blood Centre",
        "address": "Plot No.801 RAM NAGAR NEAR RAJ HOSPITAL PAL LINK ROAD, JODHPUR RAJASTHAN, JODHPUR, Dist. Jodhpur",
        "count": 12, "phone": "912913593431",
        "email": "rajbloodcentre@gmail.com", "facility": None,
        "hospitalType": "Charitable/Vol", "hospitalCode": 284134,
        "latitude": 26.296772, "longitude": 73.035143,
        "campSource": 2, "stockSource": 2, "distId": 113,
        "stateCode": 98, "type": "Blood Bank", "dist": 17792.18867553085
    },
    {
        "name": "Blood Centre M/S Jodhpur Blood Centre",
        "address": "Plot No.134 Manji Ka Hatta Paota Jodhpur, Jodhpur Rajasthan, Jodhpur, Dist. Jodhpur",
        "count": 12, "phone": "9413503289",
        "email": "jodhpurbloodcentre@gmail.com", "facility": None,
        "hospitalType": "Private", "hospitalCode": 283836,
        "latitude": 26.296772, "longitude": 73.035143,
        "campSource": 2, "stockSource": 2, "distId": 113,
        "stateCode": 98, "type": "Blood Bank", "dist": 17792.18867553085
    }
]

mapping = {
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

with app.app_context():
    imported = 0
    skipped = 0
    for item in jodhpur_data:
        existing = PublicBloodBank.query.filter_by(
            hospital_code=item.get("hospitalCode")
        ).first()
        if existing:
            skipped += 1
            continue

        record = PublicBloodBank()
        for src_key, dst_key in mapping.items():
            setattr(record, dst_key, item.get(src_key))
        db.session.add(record)
        imported += 1

    db.session.commit()
    print(f"Imported: {imported}, Skipped (already exist): {skipped}")
    print(f"Total in DB: {PublicBloodBank.query.count()}")
