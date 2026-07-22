from flask import Blueprint

from flask_jwt_extended import jwt_required

from app.utils.decorator import role_required
from app.services.donation_service import (
    accept_blood_request,
    cancel_donation,
    get_my_donations
)
donation_bp = Blueprint(
    "donation",
    __name__,
    url_prefix="/api/donations"
)


@donation_bp.post("/accept/<int:request_id>")
@jwt_required()
@role_required("donor")
def accept_request(request_id):
    return accept_blood_request(request_id)

@donation_bp.patch("/<int:donation_id>/cancel")
@jwt_required()
@role_required("donor")
def cancel_donation_route(donation_id):
    return cancel_donation(donation_id)

@donation_bp.get("/my-donations")
@jwt_required()
@role_required("donor")
def my_donations():
    return get_my_donations()