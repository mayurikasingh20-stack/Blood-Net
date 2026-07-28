from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.decorator import role_required
from app.extensions import db
from app.models.user import User
from app.models.donor import Donor
from app.models.patient import Patient
from app.models.donation import Donation, DonationStatus
from app.models.blood_request import BloodRequest, RequestStatus
from app.services.donor_service import (
    get_donor_profile,
    update_donor_profile,
    update_availability,
    get_all_donors,
    search_donors,
    get_donor_by_id,
)
from app.services.patient_service import (
    register_patient,
    get_patient_profile,
    update_patient_profile,
)
from app.services.screening_service import (
    check_donation_interval,
    submit_screening,
    get_screening_questions
)
from sqlalchemy import func

user_bp = Blueprint("user", __name__, url_prefix="/api/user")

@user_bp.get("/dashboard")
@jwt_required()
def unified_dashboard():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404

    result = {"roles": user.get_roles()}

    if user.has_role("donor"):
        donor = Donor.query.filter_by(user_id=user.id).first()
        if donor:
            donations = Donation.query.filter_by(donor_id=donor.id)
            result["donor"] = {
                "total_donations": donations.count(),
                "verified_donations": donations.filter(Donation.status == DonationStatus.VERIFIED).count(),
                "pending_donations": donations.filter(Donation.status == DonationStatus.ACCEPTED).count(),
                "cancelled_donations": donations.filter(Donation.status == DonationStatus.CANCELLED).count(),
                "availability": donor.available,
                "blood_group": donor.blood_group,
                "weight": donor.weight,
            }

    if user.has_role("patient"):
        patient = Patient.query.filter_by(user_id=user.id).first()
        if patient:
            requests = BloodRequest.query.filter_by(patient_id=patient.id)
            result["patient"] = {
                "total_requests": requests.count(),
                "active_requests": requests.filter(BloodRequest.status != RequestStatus.COMPLETED).count(),
                "completed_requests": requests.filter(BloodRequest.status == RequestStatus.COMPLETED).count(),
                "total_units_requested": db.session.query(func.coalesce(func.sum(BloodRequest.units), 0)).filter(BloodRequest.patient_id == patient.id).scalar(),
                "total_units_received": db.session.query(func.coalesce(func.sum(BloodRequest.fulfilled_units), 0)).filter(BloodRequest.patient_id == patient.id).scalar(),
            }

    return jsonify(result), 200

@user_bp.get("/donor-profile")
@jwt_required()
@role_required("donor")
def donor_profile():
    response, status = get_donor_profile()
    return jsonify(response), status

@user_bp.put("/donor-profile")
@jwt_required()
@role_required("donor")
def update_donor():
    data = request.get_json()
    response, status = update_donor_profile(data)
    return jsonify(response), status

@user_bp.patch("/availability")
@jwt_required()
@role_required("donor")
def change_availability():
    data = request.get_json()
    response, status = update_availability(data)
    return jsonify(response), status

@user_bp.get("/patient-profile")
@jwt_required()
@role_required("patient")
def patient_profile():
    return get_patient_profile()

@user_bp.put("/patient-profile")
@jwt_required()
@role_required("patient")
def update_patient():
    data = request.form
    doctor_note = request.files.get("doctor_note")
    return update_patient_profile(data, doctor_note)

@user_bp.post("/patient-register")
@jwt_required()
@role_required("patient")
def patient_register():
    data = request.form
    doctor_note = request.files.get("doctor_note")
    return register_patient(data, doctor_note)

@user_bp.get("/screening-questions")
@jwt_required()
@role_required("donor")
def screening_questions():
    return get_screening_questions()

@user_bp.post("/check-eligibility")
@jwt_required()
@role_required("donor")
def eligibility_check():
    return check_donation_interval()

@user_bp.post("/submit-screening")
@jwt_required()
@role_required("donor")
def screening_submit():
    data = request.get_json()
    return submit_screening(data)

@user_bp.get("/donors")
@jwt_required()
def all_donors():
    response, status = get_all_donors()
    return jsonify(response), status

@user_bp.get("/donors/search")
@jwt_required()
def search():
    blood_group = request.args.get("blood_group")
    if not blood_group:
        return jsonify({"message": "blood_group is required"}), 400
    response, status = search_donors(blood_group)
    return jsonify(response), status

@user_bp.get("/donors/<int:donor_id>")
@jwt_required()
def donor_details(donor_id):
    response, status = get_donor_by_id(donor_id)
    return jsonify(response), status
