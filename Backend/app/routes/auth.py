from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.services.auth_service import login_user, register_user

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.post("/register")
def register():
    response, status_code = register_user(request.get_json())
    return jsonify(response), status_code
    
@auth_bp.post("/login")
def login():
    response, status_code = login_user(request.get_json())
    return jsonify(response), status_code
    
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
