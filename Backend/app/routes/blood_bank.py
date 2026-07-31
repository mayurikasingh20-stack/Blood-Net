from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.utils.decorator import role_required
from app.services.blood_bank_service import (
    register_blood_bank,
    get_blood_bank_profile,
    update_blood_bank_profile,
    blood_bank_dashboard,
    fulfill_request,
    accept_request_as_donor,
    get_accepted_requests
)

blood_bank_bp = Blueprint(
    "blood_bank",
    __name__,
    url_prefix="/api/blood-bank"
)


@blood_bank_bp.post("/register")
@jwt_required()
@role_required("blood_bank")
def register():
    data = request.get_json()

    return register_blood_bank(
        data
    )


@blood_bank_bp.get("/profile")
@jwt_required()
@role_required("blood_bank")
def get_profile():
    return get_blood_bank_profile()


@blood_bank_bp.put("/profile")
@jwt_required()
@role_required("blood_bank")
def update_profile():
    data = request.get_json()

    return update_blood_bank_profile(
        data
    )

@blood_bank_bp.get("/dashboard")
@jwt_required()
@role_required("blood_bank")
def dashboard():
    return blood_bank_dashboard()

@blood_bank_bp.get("/my-accepted-requests")
@jwt_required()
@role_required("blood_bank")
def accepted_requests():
    return get_accepted_requests()

@blood_bank_bp.post("/fulfill-request/<int:request_id>")
@jwt_required()
@role_required("blood_bank")
def fulfill(request_id):
    return fulfill_request(request_id)

@blood_bank_bp.post("/accept-request/<int:request_id>")
@jwt_required()
@role_required("blood_bank")
def accept_as_donor(request_id):
    return accept_request_as_donor(request_id)