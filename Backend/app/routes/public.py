from datetime import datetime

from flask import Blueprint, jsonify
from app.models.blood_bank import BloodBank
from app.models.blood_request import BloodRequest, RequestStatus
from app.models.user import User
from app.services.blood_request_service import get_top_requests

public_bp = Blueprint("public", __name__, url_prefix="/api/public")


@public_bp.get("/requests/top")
def top_requests():
    return get_top_requests()


@public_bp.get("/stats")
def public_stats():
    total_users = User.query.filter(User.is_active == True).count()
    total_blood_banks = BloodBank.query.filter(BloodBank.status == "approved").count()
    active_blood_requests = BloodRequest.query.filter(
        BloodRequest.status == RequestStatus.PENDING,
        BloodRequest.required_before >= datetime.now()
    ).count()

    return jsonify({
        "total_users": total_users,
        "total_blood_banks": total_blood_banks,
        "active_blood_requests": active_blood_requests,
    }), 200
