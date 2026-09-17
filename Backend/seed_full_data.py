import os
from datetime import date, datetime
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.donor import Donor
from app.models.patient import Patient
from app.models.blood_bank import BloodBank
from app.utils.password import hash_password

PASSWORD = "password"

ADMIN_ACCOUNTS = [
    {
        "email": "admin@gmail.com",
        "password": "Welcome11",
        "first_name": "Admin",
        "last_name": "User",
        "phone": "+91 99999 00000",
    },
]

USER_CITIES = [
    ("Delhi", 28.6139, 77.2090),
    ("Mumbai", 19.0760, 72.8777),
    ("Bengaluru", 12.9716, 77.5946),
    ("Hyderabad", 17.3850, 78.4867),
    ("Chennai", 13.0827, 80.2707),
    ("Kolkata", 22.5726, 88.3639),
]

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

USERS = [
    ("Aarav", "Sharma", "aarav.sharma@example.com", "+91 90000 00001", 1993, 6, 12),
    ("Diya", "Patel", "diya.patel@example.com", "+91 90000 00002", 1995, 3, 8),
    ("Ishaan", "Verma", "ishaan.verma@example.com", "+91 90000 00003", 1991, 11, 2),
    ("Ananya", "Reddy", "ananya.reddy@example.com", "+91 90000 00004", 1997, 1, 25),
    ("Vihaan", "Nair", "vihaan.nair@example.com", "+91 90000 00005", 1990, 9, 17),
    ("Saanvi", "Gupta", "saanvi.gupta@example.com", "+91 90000 00006", 1994, 7, 30),
    ("Kabir", "Joshi", "kabir.joshi@example.com", "+91 90000 00007", 1989, 12, 5),
    ("Myra", "Chopra", "myra.chopra@example.com", "+91 90000 00008", 1996, 4, 22),
    ("Reyansh", "Mehta", "reyansh.mehta@example.com", "+91 90000 00009", 1992, 8, 14),
    ("Aadhya", "Iyer", "aadhya.iyer@example.com", "+91 90000 00010", 1998, 2, 9),
    ("Arjun", "Singh", "arjun.singh@example.com", "+91 90000 00011", 1993, 5, 3),
    ("Ira", "Bose", "ira.bose@example.com", "+91 90000 00012", 1995, 10, 19),
    ("Advait", "Kulkarni", "advait.kulkarni@example.com", "+91 90000 00013", 1991, 7, 11),
    ("Kiara", "Malhotra", "kiara.malhotra@example.com", "+91 90000 00014", 1997, 12, 27),
    ("Vivaan", "Saxena", "vivaan.saxena@example.com", "+91 90000 00015", 1990, 3, 6),
    ("Navya", "Rao", "navya.rao@example.com", "+91 90000 00016", 1994, 6, 21),
    ("Aditya", "Bhatt", "aditya.bhatt@example.com", "+91 90000 00017", 1988, 9, 29),
    ("Anika", "Das", "anika.das@example.com", "+91 90000 00018", 1996, 1, 15),
    ("Rudra", "Desai", "rudra.desai@example.com", "+91 90000 00019", 1992, 4, 7),
    ("Tanvi", "Kaur", "tanvi.kaur@example.com", "+91 90000 00020", 1999, 8, 1),
]

BANKS = [
    {
        "email": "contact@redcrossdelhi.org",
        "first_name": "RedCross", "last_name": "Delhi",
        "phone": "+91 91111 11101",
        "facility_name": "Indian Red Cross Society Blood Bank, New Delhi",
        "license_id": "LIC-DEL-2021-001",
        "contact_person": "Dr. S. Kapoor",
        "address": "Red Cross Road, New Delhi 110001",
        "operating_hours": "9:00 AM - 7:00 PM",
        "website": "https://redcrossdelhi.org",
        "available_24x7": False,
        "latitude": 28.6139, "longitude": 77.2090,
    },
    {
        "email": "bloodbank@lilavatihospital.com",
        "first_name": "Lilavati", "last_name": "BloodBank",
        "phone": "+91 91111 11102",
        "facility_name": "Lilavati Hospital Blood Bank, Mumbai",
        "license_id": "LIC-MUM-2019-014",
        "contact_person": "Dr. P. Shah",
        "address": "A-791, Bandra Reclamation, Bandra West, Mumbai 400050",
        "operating_hours": "24x7",
        "website": "https://lilavatihospital.com",
        "available_24x7": True,
        "latitude": 19.0760, "longitude": 72.8777,
    },
    {
        "email": "bloodbank@manipalhospitals.com",
        "first_name": "Manipal", "last_name": "BloodBank",
        "phone": "+91 91111 11103",
        "facility_name": "Manipal Blood Bank, Bengaluru",
        "license_id": "LIC-BLR-2020-007",
        "contact_person": "Dr. R. Hegde",
        "address": "98, HAL Airport Road, Bengaluru 560017",
        "operating_hours": "8:00 AM - 8:00 PM",
        "website": "https://manipalhospitals.com",
        "available_24x7": False,
        "latitude": 12.9716, "longitude": 77.5946,
    },
    {
        "email": "bloodbank@apollohospitals.com",
        "first_name": "Apollo", "last_name": "BloodBank",
        "phone": "+91 91111 11104",
        "facility_name": "Apollo Blood Bank, Hyderabad",
        "license_id": "LIC-HYD-2018-022",
        "contact_person": "Dr. N. Rao",
        "address": "Jubilee Hills, Hyderabad 500033",
        "operating_hours": "24x7",
        "website": "https://apollohospitals.com",
        "available_24x7": True,
        "latitude": 17.3850, "longitude": 78.4867,
    },
    {
        "email": "bloodbank@sankaranethralaya.org",
        "first_name": "Sankara", "last_name": "Nethralaya",
        "phone": "+91 91111 11105",
        "facility_name": "Sankara Nethralaya Blood Bank, Chennai",
        "license_id": "LIC-MAA-2017-011",
        "contact_person": "Dr. L. Menon",
        "address": "18 College Road, Nungambakkam, Chennai 600006",
        "operating_hours": "8:30 AM - 6:30 PM",
        "website": "https://sankaranethralaya.org",
        "available_24x7": False,
        "latitude": 13.0827, "longitude": 80.2707,
    },
    {
        "email": "info@medinovabloodbank.org",
        "first_name": "Medinova", "last_name": "BloodBank",
        "phone": "+91 91111 11106",
        "facility_name": "Medinova Blood Bank, Kolkata",
        "license_id": "LIC-CCU-2020-009",
        "contact_person": "Dr. A. Banerjee",
        "address": "62/2, CIT Road, Kolkata 700014",
        "operating_hours": "9:00 AM - 7:00 PM",
        "website": "https://medinovabloodbank.org",
        "available_24x7": False,
        "latitude": 22.5726, "longitude": 88.3639,
    },
    {
        "email": "bloodbank@dmhospital.org",
        "first_name": "DMH", "last_name": "BloodBank",
        "phone": "+91 91111 11107",
        "facility_name": "Deenanath Mangeshkar Hospital Blood Bank, Pune",
        "license_id": "LIC-PNQ-2019-016",
        "contact_person": "Dr. V. Kulkarni",
        "address": "Erandwane, Pune 411004",
        "operating_hours": "24x7",
        "website": "https://dmhospital.org",
        "available_24x7": True,
        "latitude": 18.5204, "longitude": 73.8567,
    },
    {
        "email": "bloodbank@civilhospitalahd.org",
        "first_name": "Civil", "last_name": "Hospital",
        "phone": "+91 91111 11108",
        "facility_name": "Civil Hospital Blood Bank, Ahmedabad",
        "license_id": "LIC-AMD-2018-005",
        "contact_person": "Dr. B. Joshi",
        "address": "Asarwa, Ahmedabad 380016",
        "operating_hours": "24x7",
        "website": "https://civilhospitalahd.org",
        "available_24x7": True,
        "latitude": 23.0225, "longitude": 72.5714,
    },
    {
        "email": "bloodbank@smshospitaljaipur.org",
        "first_name": "SMS", "last_name": "Hospital",
        "phone": "+91 91111 11109",
        "facility_name": "SMS Hospital Blood Bank, Jaipur",
        "license_id": "LIC-JAI-2021-013",
        "contact_person": "Dr. K. Sharma",
        "address": "J.L.N. Marg, Jaipur 302004",
        "operating_hours": "9:00 AM - 7:00 PM",
        "website": "https://smshospitaljaipur.org",
        "available_24x7": False,
        "latitude": 26.9124, "longitude": 75.7873,
    },
    {
        "email": "bloodbank@kgmcindia.org",
        "first_name": "KGMU", "last_name": "BloodBank",
        "phone": "+91 91111 11110",
        "facility_name": "King George's Medical University Blood Bank, Lucknow",
        "license_id": "LIC-LKO-2017-008",
        "contact_person": "Dr. S. Misra",
        "address": "Shah Mina Road, Chowk, Lucknow 226003",
        "operating_hours": "24x7",
        "website": "https://kgmcindia.org",
        "available_24x7": True,
        "latitude": 26.8467, "longitude": 80.9462,
    },
]

app = create_app()

credentials = []
credentials.append("BLOOD NET - DEMO CREDENTIALS")
credentials.append("All passwords = password")
credentials.append("")
credentials.append("ADMIN ACCOUNTS")
for admin in ADMIN_ACCOUNTS:
    credentials.append(f"  {admin['email']} / {admin['password']}")
credentials.append("")


def normalize_phone(phone):
    return "".join(ch for ch in phone if ch.isdigit())


with app.app_context():
    created_admins = 0
    for admin in ADMIN_ACCOUNTS:
        user = User.query.filter_by(email=admin["email"]).first()
        if user is None:
            user = User(
                first_name=admin["first_name"],
                last_name=admin["last_name"],
                email=admin["email"],
                phone=normalize_phone(admin["phone"]),
                password_hash=hash_password(admin["password"]),
                role="admin",
                gender="Other",
                dob=date(1990, 1, 1),
                city="System",
                phone_verified=True,
                is_active=True,
            )
            db.session.add(user)
            created_admins += 1
            print(f"Created admin: {admin['email']}")
        else:
            user.password_hash = hash_password(admin["password"])
            user.role = "admin"
            user.phone_verified = True
            user.is_active = True
            print(f"Updated admin: {admin['email']}")

    created_users = 0
    for i, (first, last, email, phone, y, m, d) in enumerate(USERS):
        if User.query.filter_by(phone=phone).first() or User.query.filter_by(email=email).first():
            print(f"User {email} already exists, skipping")
            continue

        city, lat, lng = USER_CITIES[i % len(USER_CITIES)]
        blood_group = BLOOD_GROUPS[i % len(BLOOD_GROUPS)]
        gender = "Male" if i % 2 == 0 else "Female"

        user = User(
            first_name=first,
            last_name=last,
            email=email,
            phone=phone,
            password_hash=hash_password(PASSWORD),
            role="donor,patient",
            gender=gender,
            dob=date(y, m, d),
            city=city,
            phone_verified=True,
            is_active=True,
        )
        db.session.add(user)
        db.session.flush()

        donor = Donor(
            user_id=user.id,
            blood_group=blood_group,
            weight=65.0 + (i % 15),
            is_eligible=True,
            available=True,
            screening_completed=True,
            screening_result="passed",
            has_chronic_condition=False,
            on_medication=False,
        )
        db.session.add(donor)

        patient = Patient(
            user_id=user.id,
            blood_group_needed=blood_group,
            hospital_name="City General Hospital",
            condition_description="Patient requires blood transfusion",
            urgency_level="Moderate",
            relation_to_patient="Self",
            verification_status="Verified",
            status="Approved",
        )
        db.session.add(patient)

        created_users += 1
        credentials.append(f"USER  | {first} {last} | email: {email} | phone: {phone} | password: password | city: {city} | blood: {blood_group}")
        print(f"Created user: {first} {last} ({email})")

    created_banks = 0
    for b in BANKS:
        if User.query.filter_by(email=b["email"]).first() or User.query.filter_by(phone=b["phone"]).first():
            print(f"Blood bank {b['email']} already exists, skipping")
            continue

        user = User(
            first_name=b["first_name"],
            last_name=b["last_name"],
            email=b["email"],
            phone=b["phone"],
            password_hash=hash_password(PASSWORD),
            role="blood_bank",
            gender="Other",
            dob=date(1985, 1, 1),
            city=b["address"].split(",")[0].strip(),
            phone_verified=True,
            is_active=True,
        )
        db.session.add(user)
        db.session.flush()

        bank = BloodBank(
            user_id=user.id,
            facility_name=b["facility_name"],
            license_id=b["license_id"],
            contact_person=b["contact_person"],
            address=b["address"],
            status="approved",
            verified_at=datetime.utcnow(),
            latitude=b["latitude"],
            longitude=b["longitude"],
            operating_hours=b["operating_hours"],
            website=b["website"],
            available_24x7=b["available_24x7"],
        )
        db.session.add(bank)

        created_banks += 1
        credentials.append(f"BANK  | {b['facility_name']} | email: {b['email']} | phone: {b['phone']} | password: password")
        print(f"Created blood bank: {b['facility_name']} ({b['email']})")

    db.session.commit()

    credentials_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "credentials.txt")
    credentials_path = os.path.abspath(credentials_path)
    with open(credentials_path, "w", encoding="utf-8") as f:
        f.write("\n".join(credentials) + "\n")

    print("\n=== Summary ===")
    print(f"Admins created: {created_admins} / {len(ADMIN_ACCOUNTS)}")
    print(f"Users created: {created_users} / {len(USERS)}")
    print(f"Blood banks created: {created_banks} / {len(BANKS)}")
    print("Demo user and blood bank passwords set to: password")
    print(f"Credentials saved to: {credentials_path}")
