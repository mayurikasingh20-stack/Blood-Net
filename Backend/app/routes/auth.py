from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app.extensions import db
from app.models.user import User
from app.models.donor import Donor
from app.models.patient import Patient
from app.services.auth_service import login_user, register_user
from app.services.twilio_service import send_otp, check_otp
from app.utils.helpers import get_missing_fields
from app.utils.validators import normalize_phone

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.post("/send-otp")
def send_otp_route():
    data = request.get_json(silent=True) or {}
    phone = data.get("phone", "").strip()
    if not phone:
        return jsonify({"message": "Phone number is required."}), 400

    normalized = normalize_phone(phone)
    if not normalized:
        return jsonify({"message": "Invalid phone number. Use E.164 format (e.g. +911234567890)."}), 400

    if User.query.filter_by(phone=normalized).first():
        return jsonify({"message": "Phone number already registered."}), 409

    twilio_phone = f"+91{normalized}"

    try:
        status = send_otp(twilio_phone)
        return jsonify({"message": "OTP sent successfully.", "status": status}), 200
    except Exception as e:
        current_app.logger.error(f"Twilio send-otp failed: {e}")
        return jsonify({"message": "Failed to send OTP. Check phone number and try again."}), 500


@auth_bp.post("/verify-otp")
def verify_otp_route():
    data = request.get_json(silent=True) or {}
    phone = data.get("phone", "").strip()
    code = data.get("code", "").strip()

    if not phone or not code:
        return jsonify({"message": "Phone and code are required."}), 400

    normalized = normalize_phone(phone)
    if not normalized:
        return jsonify({"message": "Invalid phone number."}), 400

    twilio_phone = f"+91{normalized}"

    try:
        status = check_otp(twilio_phone, code)
        if status == "approved":
            if not hasattr(current_app, '_verified_phones'):
                current_app._verified_phones = set()
            current_app._verified_phones.add(normalized)
            return jsonify({"message": "Phone verified successfully.", "verified": True}), 200
        else:
            return jsonify({"message": "Invalid or expired code. Please try again.", "verified": False}), 400
    except Exception as e:
        current_app.logger.error(f"Twilio verify-otp failed: {e}")
        return jsonify({"message": "Verification failed. Please try again."}), 500


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    response, status_code = register_user(data)

    if status_code == 201 and hasattr(current_app, '_verified_phones'):
        phone = normalize_phone(data.get("phone", ""))
        if phone and phone in current_app._verified_phones:
            user = User.query.filter_by(phone=phone).first()
            if user:
                user.phone_verified = True
                db.session.commit()
                current_app._verified_phones.discard(phone)

    return jsonify(response), status_code
    
@auth_bp.post("/login")
def login():
    response, status_code = login_user(request.get_json())
    return jsonify(response), status_code
    
@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    access_token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": access_token}), 200

@auth_bp.get("/profile")
@jwt_required()
def profile():

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    return jsonify({
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "roles": user.get_roles(),
        "gender": user.gender,
        "city": user.city
    }), 200

@auth_bp.patch("/profile")
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    if "first_name" in data: user.first_name = data["first_name"]
    if "last_name" in data: user.last_name = data["last_name"]
    if "email" in data: user.email = data["email"].strip().lower()
    if "phone" in data: user.phone = data["phone"]
    if "city" in data: user.city = data["city"]

    try:
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        return jsonify({
            "message": "Failed to update profile",
            "error": str(exc)
        }), 500
    return jsonify({"message": "Profile updated successfully"}), 200

@auth_bp.post("/change-password")
@jwt_required()
def change_password():
    from app.utils.password import hash_password, verify_password

    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"message": "Current password and new password are required."}), 400
    if len(new_password) < 6:
        return jsonify({"message": "New password must be at least 6 characters."}), 400
    if not verify_password(user.password_hash, current_password):
        return jsonify({"message": "Current password is incorrect."}), 401

    user.password_hash = hash_password(new_password)
    db.session.commit()
    return jsonify({"message": "Password changed successfully."}), 200

@auth_bp.post("/add-role")
@jwt_required()
def add_role():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    new_role = data.get("role", "").strip().lower()

    if new_role not in ("donor", "patient"):
        return jsonify({"message": "Can only add 'donor' or 'patient' role."}), 400

    if user.has_role(new_role):
        return jsonify({"message": f"You already have the '{new_role}' role."}), 409

    if new_role == "donor" and Donor.query.filter_by(user_id=user.id).first():
        return jsonify({"message": "Donor profile already exists."}), 409

    if new_role == "patient" and Patient.query.filter_by(user_id=user.id).first():
        return jsonify({"message": "Patient profile already exists."}), 409

    if new_role == "donor":
        required = ["blood_group", "weight"]
        missing = get_missing_fields(data, required)
        if missing:
            return jsonify({"message": "Missing required fields", "missing_fields": missing}), 400
        donor = Donor(
            user_id=user.id,
            blood_group=data["blood_group"],
            weight=float(data["weight"]),
        )
        db.session.add(donor)

    if new_role == "patient":
        patient = Patient(
            user_id=user.id,
            blood_group_needed=data.get("blood_group_needed", "Unknown"),
            hospital_name=data.get("hospital_name", "Pending"),
            condition_description=data.get("condition_description", "Pending"),
            urgency_level=data.get("urgency_level", "Moderate"),
            relation_to_patient=data.get("relation_to_patient", "Self"),
        )
        db.session.add(patient)

    user.add_role(new_role)
    try:
        db.session.commit()
        return jsonify({
            "message": f"'{new_role}' role added successfully.",
            "role": user.role,
            "roles": user.get_roles()
        }), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"message": "Failed to add role", "error": str(exc)}), 500
