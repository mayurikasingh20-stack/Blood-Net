from datetime import date
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.donor import Donor
from app.models.patient import Patient
from app.models.blood_bank import BloodBank
from app.utils.password import hash_password

app = create_app()

with app.app_context():
    donors_data = [
        {
            "first_name": "Rahul", "last_name": "Sharma",
            "email": "rahul.sharma@email.com", "phone": "+91 98765 43201",
            "blood_group": "A+", "weight": 70.0,
        },
        {
            "first_name": "Priya", "last_name": "Patel",
            "email": "priya.patel@email.com", "phone": "+91 98765 43202",
            "blood_group": "O+", "weight": 65.0,
        },
    ]

    patients_data = [
        {
            "first_name": "Amit", "last_name": "Singh",
            "email": "amit.singh@email.com", "phone": "+91 98765 43203",
            "blood_group_needed": "B+", "hospital_name": "AIIMS Jodhpur",
            "condition_description": "Accident trauma requiring urgent blood transfusion",
            "urgency_level": "Critical", "relation_to_patient": "Self",
        },
        {
            "first_name": "Neha", "last_name": "Gupta",
            "email": "neha.gupta@email.com", "phone": "+91 98765 43204",
            "blood_group_needed": "AB+", "hospital_name": "Fortis Hospital Jodhpur",
            "condition_description": "Surgery preparation requiring blood",
            "urgency_level": "High", "relation_to_patient": "Family",
        },
    ]

    banks_data = [
        {
            "email": "contact@redcrossjodhpur.org",
            "first_name": "RedCross", "last_name": "Jodhpur",
            "phone": "+91 98765 43205",
            "facility_name": "Red Cross Blood Bank Jodhpur",
            "contact_person": "Dr. Mehta",
            "address": "Red Cross Building, Jodhpur",
            "status": "approved",
        },
        {
            "email": "info@jodhpurbloodbank.com",
            "first_name": "Jodhpur", "last_name": "BloodBank",
            "phone": "+91 98765 43206",
            "facility_name": "Jodhpur Central Blood Bank",
            "contact_person": "Dr. Singhvi",
            "address": "Central Hospital Road, Jodhpur",
            "status": "approved",
        },
    ]

    created = []

    for d in donors_data:
        if User.query.filter_by(phone=d["phone"]).first():
            print(f"Donor {d['phone']} already exists, skipping")
            continue
        user = User(
            first_name=d["first_name"], last_name=d["last_name"],
            email=d["email"], phone=d["phone"],
            password_hash=hash_password("password"),
            role="donor", gender="Male", dob=date(1990, 6, 15), city="Jodhpur",
        )
        db.session.add(user)
        db.session.flush()
        donor = Donor(
            user_id=user.id, blood_group=d["blood_group"],
            weight=d["weight"], is_eligible=True, available=True,
        )
        db.session.add(donor)
        created.append(("Donor", d["first_name"], d["phone"]))
        print(f"Created donor: {d['first_name']} ({d['phone']})")

    for p in patients_data:
        if User.query.filter_by(phone=p["phone"]).first():
            print(f"Patient {p['phone']} already exists, skipping")
            continue
        user = User(
            first_name=p["first_name"], last_name=p["last_name"],
            email=p["email"], phone=p["phone"],
            password_hash=hash_password("password"),
            role="patient", gender="Male" if p["first_name"] == "Amit" else "Female",
            dob=date(1995, 3, 10), city="Jodhpur",
        )
        db.session.add(user)
        db.session.flush()
        patient = Patient(
            user_id=user.id,
            blood_group_needed=p["blood_group_needed"],
            hospital_name=p["hospital_name"],
            condition_description=p["condition_description"],
            urgency_level=p["urgency_level"],
            relation_to_patient=p["relation_to_patient"],
            verification_status="Verified", status="Approved",
        )
        db.session.add(patient)
        created.append(("Patient", p["first_name"], p["phone"]))
        print(f"Created patient: {p['first_name']} ({p['phone']})")

    for b in banks_data:
        if User.query.filter_by(email=b["email"]).first():
            print(f"BloodBank {b['email']} already exists, skipping")
            continue
        user = User(
            first_name=b["first_name"], last_name=b["last_name"],
            email=b["email"], phone=b["phone"],
            password_hash=hash_password("password"),
            role="blood_bank", gender="Other", dob=date(1985, 1, 1), city="Jodhpur",
        )
        db.session.add(user)
        db.session.flush()
        bank = BloodBank(
            user_id=user.id,
            facility_name=b["facility_name"],
            contact_person=b["contact_person"],
            address=b["address"],
            status=b["status"],
        )
        db.session.add(bank)
        created.append(("BloodBank", b["facility_name"], b["email"]))
        print(f"Created blood bank: {b['facility_name']} ({b['email']})")

    db.session.commit()
    print("\n=== Summary ===")
    for typ, name, ident in created:
        print(f"  {typ}: {name} -> {ident}")
    print("\nAll passwords set to: password")
