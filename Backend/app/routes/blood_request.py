from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from app.utils.decorator import role_required
from app.services.blood_request_service import (
    create_blood_request,
    get_my_requests,
    get_open_requests,
    get_request_by_id,
    get_accepted_donors,
    update_blood_request,
    cancel_blood_request,
    get_matching_donors
)

blood_request_bp = Blueprint(
    "blood_request",
    __name__,
    url_prefix="/api/blood-request"
)


@blood_request_bp.post("/create")
@jwt_required()
@role_required("patient", "blood_bank")
def create():
    data = request.get_json()
    return create_blood_request(data)


@blood_request_bp.get("/my-requests")
@jwt_required()
@role_required("patient", "blood_bank")
def my_requests():
    return get_my_requests()


@blood_request_bp.get("/open")
@jwt_required()
@role_required("patient", "blood_bank", "donor", "admin")
def open_requests():
    return get_open_requests()


@blood_request_bp.get("/<int:request_id>/accepted-donors")
@jwt_required()
@role_required("patient", "admin")
def accepted_donors(request_id):
    return get_accepted_donors(request_id)


@blood_request_bp.get("/<int:request_id>")
@jwt_required()
@role_required("patient", "blood_bank")
def single_request(request_id):
    return get_request_by_id(request_id)


@blood_request_bp.put("/<int:request_id>")
@jwt_required()
@role_required("patient", "blood_bank")
def update(request_id):
    data = request.get_json()
    return update_blood_request(
        request_id,
        data
    )


@blood_request_bp.patch("/<int:request_id>/cancel")
@jwt_required()
@role_required("patient", "blood_bank")
def cancel(request_id):
    return cancel_blood_request(request_id)

@blood_request_bp.get("/<int:request_id>/matching-donors")
@jwt_required()
@role_required("patient", "blood_bank", "admin")
def matching_donors(request_id):
    return get_matching_donors(request_id)