from flask import Blueprint, jsonify

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.get("/health")
def health_check():
    """Temporary endpoint confirming the authentication blueprint is active."""
    return jsonify({"status": "ok", "service": "auth"})
