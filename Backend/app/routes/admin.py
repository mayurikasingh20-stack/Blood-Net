from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from app.utils.decorator import role_required
from app.services.admin_service import (
    get_all_blood_banks,
    get_blood_bank_by_id,
    approve_blood_bank,
    reject_blood_bank,
    get_all_blood_requests,
    get_blood_request_by_id,
    complete_blood_request,
    get_all_donations,
    get_donation_by_id,
    verify_donation,
    reject_donation,
    get_all_camps,
    admin_dashboard
)

admin_bp = Blueprint(
    "admin",
    __name__,
    url_prefix="/api/admin"
)


@admin_bp.get("/blood-banks")
@jwt_required()
@role_required("admin")
def all_blood_banks():
    return get_all_blood_banks()


@admin_bp.get("/blood-banks/<int:blood_bank_id>")
@jwt_required()
@role_required("admin")
def single_blood_bank(blood_bank_id):
    return get_blood_bank_by_id(blood_bank_id)


@admin_bp.patch("/blood-banks/<int:blood_bank_id>/approve")
@jwt_required()
@role_required("admin")
def approve(blood_bank_id):
    return approve_blood_bank(blood_bank_id)


@admin_bp.patch("/blood-banks/<int:blood_bank_id>/reject")
@jwt_required()
@role_required("admin")
def reject(blood_bank_id):
    data = request.get_json()

    return reject_blood_bank(
        blood_bank_id,
        data
    )
    
@admin_bp.get("/blood-requests")
@jwt_required()
@role_required("admin")
def all_blood_requests():
    return get_all_blood_requests()

@admin_bp.get("/blood-requests/<int:request_id>")
@jwt_required()
@role_required("admin")
def blood_request_by_id(request_id):
    return get_blood_request_by_id(request_id)

@admin_bp.patch("/blood-requests/<int:request_id>/complete")
@jwt_required()
@role_required("admin")
def complete_blood_request_route(request_id):
    return complete_blood_request(request_id)

@admin_bp.get("/donations")
@jwt_required()
@role_required("admin")
def all_donations():
    return get_all_donations()

@admin_bp.get("/donations/<int:donation_id>")
@jwt_required()
@role_required("admin")
def donation_by_id(donation_id):
    return get_donation_by_id(donation_id)

@admin_bp.patch("/donations/<int:donation_id>/verify")
@jwt_required()
@role_required("admin")
def verify_donation_route(donation_id):
    data = request.get_json()

    return verify_donation(
        donation_id,
        data
    )
    
@admin_bp.patch("/donations/<int:donation_id>/reject")
@jwt_required()
@role_required("admin")
def reject_donation_route(donation_id):
    data = request.get_json()
    return reject_donation(
        donation_id,
        data
    )
    
@admin_bp.get("/camps")
@jwt_required()
@role_required("admin")
def all_camps():
    return get_all_camps()

@admin_bp.get("/dashboard")
@jwt_required()
@role_required("admin")
def dashboard():
    return admin_dashboard()