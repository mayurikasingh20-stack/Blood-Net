from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.decorator import role_required
from app.services.donor_service import (
    register_donor,
    get_donor_profile,
    update_donor_profile,
    update_availability,
    get_all_donors,
    search_donors,
    get_donor_by_id,
    donor_dashboard
)
donor_bp = Blueprint(
    "donor",__name__,url_prefix="/api/donor"
)

@donor_bp.post("/register")
@jwt_required()
@role_required("donor")
def create_donor():
    data = request.get_json()
    user_id = int(get_jwt_identity())
    response, status_code = register_donor(user_id, data)
    return response, status_code

@donor_bp.get("/profile")
@jwt_required()
@role_required("donor")
def donor_profile():
    response, status = get_donor_profile()
    return jsonify(response), status

@donor_bp.put("/profile")
@jwt_required()
@role_required("donor")
def update_profile():
    data = request.get_json()
    response, status = update_donor_profile(data)
    return jsonify(response), status

@donor_bp.patch("/availability")
@jwt_required()
@role_required("donor")
def change_availability():
    data = request.get_json()
    response, status = update_availability(data)
    return jsonify(response), status

@donor_bp.get("/all")
@jwt_required()
def all_donors():

    response, status = get_all_donors()

    return jsonify(response), status

@donor_bp.get("/search")
@jwt_required()
def search():
    blood_group = request.args.get("blood_group")
    if not blood_group:
        return jsonify({
            "message": "blood_group is required"
        }), 400

    response, status = search_donors(blood_group)
    return jsonify(response), status

@donor_bp.get("/<int:donor_id>")
@jwt_required()
def donor_details(donor_id):

    response, status = get_donor_by_id(donor_id)

    return jsonify(response), status

@donor_bp.get("/dashboard")
@jwt_required()
@role_required("donor")
def donor_dashboard_route():
    return donor_dashboard()