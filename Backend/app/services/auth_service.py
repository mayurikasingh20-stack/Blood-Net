import traceback
from datetime import datetime, date
from app.utils.helpers import get_missing_fields
from flask_jwt_extended import create_access_token, create_refresh_token

from app.extensions import db
from app.models.user import User
from app.models.donor import Donor
from app.models.patient import Patient
from app.models.blood_bank import BloodBank
from app.utils.password import hash_password, verify_password
from app.utils.validators import is_valid_email, normalize_phone


def calculate_age(dob):
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def get_missing_fields(data, required_fields):
    missing = []
    for field in required_fields:
        if field not in data or not data[field]:
            missing.append(field)
    return missing


def register_user(data):
    """Perform the registration business logic and return a response tuple."""
    if not data:
        return {"message": "No data recieved"}, 400

    required_fields = [
        "first_name",
        "last_name",
        "phone",
        "password",
        "role",
        "gender",
        "dob",
        "city",
    ]
    if data.get("role") in ("blood_bank", "admin"):
        required_fields.append("email")

    missing_fields = get_missing_fields(data, required_fields)
    if missing_fields:
        return {
            "message": "Missing required fields",
            "missing_fields": missing_fields,
        }, 400

    email = None
    if data.get("email"):
        email = data["email"].strip().lower()
        if not is_valid_email(email):
            return {"message": "Invalid email address"}, 400
        if User.query.filter_by(email=email).first():
            return {"message": "Email already registered"}, 409

    normalized_phone = normalize_phone(data["phone"])
    if not normalized_phone:
        return {"message": "Invalid phone number"}, 400

    if User.query.filter_by(phone=normalized_phone).first():
        return {"message": "Phone number already registered"}, 409

    hashed_password = hash_password(data["password"])

    try:
        dob = datetime.strptime(data["dob"], "%Y-%m-%d").date()
    except ValueError:
        return {"message": "Invalid date format: use yyyy-mm-dd"}, 400

    if dob > date.today():
        return {"message": "Date of birth cannot be in the future."}, 400

    if data["role"] == "donor":
        age = calculate_age(dob)
        if age < 18:
            return {
                "message": "You must be at least 18 years old to register as a blood donor."
            }, 400
        if age > 65:
            return {
                "message": "People above 65 years of age are not eligible for blood donation. Please consult a medical professional if you have any questions."
            }, 400

    new_user = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=email,
        phone=normalized_phone,
        password_hash=hashed_password,
        role=data["role"],
        gender=data["gender"],
        dob=dob,
        city=data["city"],
        address=data.get("address"),
    )

    donor_profile = None
    if data["role"] == "donor":
        donor_required_fields = ["blood_group", "weight"]
        donor_missing_fields = get_missing_fields(data, donor_required_fields)
        if donor_missing_fields:
            return {
                "message": "Missing required donor profile fields",
                "missing_fields": donor_missing_fields,
            }, 400

        last_donation_date = None
        if data.get("last_donation_date"):
            try:
                last_donation_date = datetime.strptime(
                    data["last_donation_date"],
                    "%Y-%m-%d"
                ).date()
            except ValueError:
                return {
                    "message": "Invalid last_donation_date format. Use YYYY-MM-DD"
                }, 400

        donor_profile = Donor(
            user=new_user,
            blood_group=data["blood_group"],
            weight=data["weight"],
            last_donation_date=last_donation_date,
            has_chronic_condition=data.get("has_chronic_condition", False),
            on_medication=data.get("on_medication", False),
            available=data.get("available", True),
        )

    patient_profile = None
    if data["role"] == "patient":
        patient_profile = Patient(
            user=new_user,
            blood_group_needed=data.get("blood_group_needed", "Unknown"),
            hospital_name=data.get("hospital_name", "Pending"),
            condition_description=data.get("condition_description", "Pending"),
            urgency_level=data.get("urgency_level", "Moderate"),
            relation_to_patient=data.get("relation_to_patient", "Self"),
        )

    try:
        db.session.add(new_user)
        if donor_profile:
            db.session.add(donor_profile)
        if patient_profile:
            db.session.add(patient_profile)
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        traceback.print_exc()
        return {
            "message": "Registration failed",
            "error": str(exc),
        }, 500

    return {"message": "registered successfully"}, 201


def login_user(data):

    if not data:
        return {"message": "No JSON data received"}, 400

    identifier = data.get("identifier", "").strip()
    password = data.get("password", "")

    if not identifier:
        return {"message": "Please enter your email or phone number"}, 400
    if not password:
        return {"message": "Please enter your password"}, 400

    user = None
    if "@" in identifier:
        email = identifier.lower()
        user = User.query.filter_by(email=email).first()
    else:
        normalized_phone = normalize_phone(identifier)
        if normalized_phone:
            user = User.query.filter_by(phone=normalized_phone).first()
        if not user and normalized_phone:
            for candidate in User.query.all():
                if normalize_phone(candidate.phone) == normalized_phone:
                    user = candidate
                    break

    if not user or not verify_password(user.password_hash, password):
        return {"message": "Credentials not matched"}, 401

    if user.role == "blood_bank":
        blood_bank = BloodBank.query.filter_by(user_id=user.id).first()
        if blood_bank and blood_bank.status == "rejected":
            return {"message": "Your blood bank registration has been rejected by admin."}, 403

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return {
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "name": f"{user.first_name} {user.last_name}",
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
        },
    }, 200