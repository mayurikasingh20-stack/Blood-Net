from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.patient import Patient
from app.models.blood_request import BloodRequest, RequestStatus
from app.utils.file_upload import (
    save_uploaded_file,
    delete_uploaded_file
)


def register_patient(data, doctor_note):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)

    if user is None:
        return {
            "message": "User not found."
        }, 404

    existing = Patient.query.filter_by(
        user_id=user.id
    ).first()

    if existing:
        return {
            "message": "Patient profile already exists."
        }, 409

    try:
        doctor_note_path = save_uploaded_file(
            doctor_note,
            "doctor_notes"
        )
    except ValueError as e:
        return {
            "message": str(e)
        }, 400

    patient = Patient(
        user_id=user.id,
        blood_group_needed=data["blood_group_needed"],
        hospital_name=data["hospital_name"],
        condition_description=data["condition_description"],
        urgency_level=data.get(
            "urgency_level",
            "Moderate"
        ),
        relation_to_patient=data[
            "relation_to_patient"
        ],
        doctor_note_path=doctor_note_path,
        additional_notes=data.get(
            "additional_notes"
        )
    )

    db.session.add(patient)
    db.session.commit()

    return {
        "message": "Patient profile created successfully.",
        "verification_status": patient.verification_status
    }, 201


def get_patient_profile():
    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if user is None:
        return {
            "message": "User not found."
        }, 404

    patient = Patient.query.filter_by(
        user_id=user.id
    ).first()

    if patient is None:
        return {
            "message": "Patient profile not found."
        }, 404

    return {
        "patient": {
            "id": patient.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "gender": user.gender,
            "dob": str(user.dob),
            "city": user.city,
            "address": user.address,

            "blood_group_needed": patient.blood_group_needed,
            "hospital_name": patient.hospital_name,
            "condition_description": patient.condition_description,
            "urgency_level": patient.urgency_level,
            "relation_to_patient": patient.relation_to_patient,
            "doctor_note_path": patient.doctor_note_path,
            "verification_status": patient.verification_status,
            "verified_at": (
                patient.verified_at.isoformat()
                if patient.verified_at
                else None
            ),
            "rejection_reason": patient.rejection_reason,
            "status": patient.status,
            "additional_notes": patient.additional_notes,
            "created_at": patient.created_at.isoformat(),
            "updated_at": patient.updated_at.isoformat()
        }
    }, 200


def update_patient_profile(data, doctor_note):
    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if user is None:
        return {
            "message": "User not found."
        }, 404

    patient = Patient.query.filter_by(
        user_id=user.id
    ).first()

    if patient is None:
        return {
            "message": "Patient profile not found."
        }, 404

    patient.blood_group_needed = data.get(
        "blood_group_needed",
        patient.blood_group_needed
    )

    patient.hospital_name = data.get(
        "hospital_name",
        patient.hospital_name
    )

    patient.condition_description = data.get(
        "condition_description",
        patient.condition_description
    )

    patient.urgency_level = data.get(
        "urgency_level",
        patient.urgency_level
    )

    patient.relation_to_patient = data.get(
        "relation_to_patient",
        patient.relation_to_patient
    )

    patient.additional_notes = data.get(
        "additional_notes",
        patient.additional_notes
    )

    if doctor_note:
        try:
            delete_uploaded_file(
                patient.doctor_note_path
            )

            patient.doctor_note_path = save_uploaded_file(
                doctor_note,
                "doctor_notes"
            )

            # Reset verification because the supporting document changed
            patient.verification_status = "pending"
            patient.verified_at = None
            patient.rejection_reason = None

        except ValueError as e:
            return {
                "message": str(e)
            }, 400

    db.session.commit()

    return {
        "message": "Patient profile updated successfully."
    }, 200
    
from sqlalchemy import func

def patient_dashboard():

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if user is None:
        return {
            "message": "User not found."
        }, 404

    patient = Patient.query.filter_by(
        user_id=user.id
    ).first()

    if patient is None:
        return {
            "message": "Patient profile not found."
        }, 404

    requests = BloodRequest.query.filter_by(
        patient_id=patient.id
    )

    total_requests = requests.count()

    active_requests = requests.filter(
        BloodRequest.status != RequestStatus.COMPLETED
    ).count()

    completed_requests = requests.filter(
        BloodRequest.status == RequestStatus.COMPLETED
    ).count()

    total_units_requested = (
        db.session.query(
            func.coalesce(func.sum(BloodRequest.units), 0)
        )
        .filter(BloodRequest.patient_id == patient.id)
        .scalar()
    )

    total_units_received = (
        db.session.query(
            func.coalesce(func.sum(BloodRequest.fulfilled_units), 0)
        )
        .filter(BloodRequest.patient_id == patient.id)
        .scalar()
    )

    return {
        "total_requests": total_requests,
        "active_requests": active_requests,
        "completed_requests": completed_requests,
        "total_units_requested": total_units_requested,
        "total_units_received": total_units_received
    }, 200