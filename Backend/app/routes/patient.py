from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.utils.decorator import role_required
from app.services.patient_service import (
    register_patient,
    get_patient_profile,
    update_patient_profile,
    patient_dashboard
)

patient_bp = Blueprint(
    "patient",
    __name__,
    url_prefix="/api/patient"
)

@patient_bp.post("/register")
@jwt_required()
@role_required("patient")
def register():
    data = request.form
    doctor_note = request.files.get("doctor_note")
    return register_patient(
        data,
        doctor_note
    )

@patient_bp.get("/profile")
@jwt_required()
@role_required("patient")
def get_profile():
    return get_patient_profile()

@patient_bp.put("/profile")
@jwt_required()
@role_required("patient")
def update_profile():
    data = request.form
    doctor_note = request.files.get("doctor_note")
    return update_patient_profile(
        data,
        doctor_note
    )
    
@patient_bp.get("/dashboard")
@jwt_required()
@role_required("patient")
def dashboard():
    return patient_dashboard()