from datetime import datetime
from app.utils.helpers import get_missing_fields
from flask_jwt_extended import create_access_token

from app.extensions import db
from app.models.user import User
from app.models.donor import Donor
from app.models.patient import Patient
from app.utils.password import hash_password, verify_password
from app.utils.validators import is_valid_email, normalize_phone


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
            return {"message": "Credentials not matched"}, 409

    normalized_phone = normalize_phone(data["phone"])
    if not normalized_phone:
        return {"message": "Invalid phone number"}, 400

    if User.query.filter_by(phone=normalized_phone).first():
        return {"message": "Credentials not matched"}, 409

    hashed_password = hash_password(data["password"])

    try:
        dob = datetime.strptime(data["dob"], "%Y-%m-%d").date()
    except ValueError:
        return {"message": "Invalid date format: use yyyy-mm-dd"}, 400

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
        return {
            "message": "Registration failed",
            "error": str(exc),
        }, 500

    return {"message": "registered successfully"}, 201


def login_user(data):

    if not data:
        return {"message": "No JSON data received"}, 400

    role = data.get("role")
    if role in ("donor", "patient"):
        required_fields = ["phone", "password"]
    else:
        required_fields = ["email", "password"]

    missing_fields = get_missing_fields(data, required_fields)

    if missing_fields:
        return {
            "message": "Missing required fields",
            "missing_fields": missing_fields,
        }, 400

    user = None
    if role in ("donor", "patient"):
        normalized_phone = normalize_phone(data["phone"])
        if normalized_phone:
            user = User.query.filter_by(phone=normalized_phone).first()
        if not user:
            for candidate in User.query.all():
                if normalize_phone(candidate.phone) == normalized_phone:
                    user = candidate
                    break
    else:
        email = data["email"].strip().lower()
        user = User.query.filter_by(email=email).first()

    if not user or not verify_password(user.password_hash, data["password"]):
        return {"message": "Credentials not matched"}, 401

    requested_role = data.get("role")
    if user.role != requested_role:
        return {
            "message": "Credentials not matched"
        }, 401

    access_token = create_access_token(identity=str(user.id))

    return {
        "message": "Login successful",
        "access_token": access_token,
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

