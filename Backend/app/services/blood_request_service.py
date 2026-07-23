from datetime import datetime

from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.patient import Patient
from app.models.donor import Donor
from app.models.blood_bank import BloodBank
from app.models.donation import Donation, DonationStatus
from app.models.blood_request import BloodRequest, RequestStatus, UrgencyLevel
from app.utils.helpers import create_notification
from app.utils.validators import VALID_BLOOD_GROUPS

URGENCY_ORDER = {"Critical": 0, "High": 1, "Moderate": 2, "Low": 3}

def validate_request_data(data):
    errors = {}
    required_fields = {
        "blood_group": "Blood group is required.",
        "units": "Units are required.",
        "hospital": "Hospital is required.",
        "hospital_address": "Hospital address is required.",
        "city": "City is required.",
        "required_before": "Required-by date is required.",
        "contact_name": "Contact name is required.",
        "contact_phone": "Contact phone is required.",
    }
    for field, msg in required_fields.items():
        if not data.get(field):
            errors[field] = msg

    if not errors.get("blood_group") and data["blood_group"] not in VALID_BLOOD_GROUPS:
        errors["blood_group"] = "Invalid blood group."

    if not errors.get("units"):
        try:
            units = int(data["units"])
            if units <= 0:
                errors["units"] = "Units must be greater than 0."
        except (TypeError, ValueError):
            errors["units"] = "Units must be a number."

    return errors


def create_blood_request(data):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if user is None:
        return {"message": "User not found."}, 404

    errors = validate_request_data(data)
    if errors:
        return {"errors": errors}, 400

    patient = None
    blood_bank = None
    if user.role == "patient":
        patient = Patient.query.filter_by(user_id=user.id).first()
        if patient is None:
            patient = Patient(
                user=user,
                blood_group_needed=data.get("blood_group", "Unknown"),
                hospital_name=data.get("hospital", "Pending"),
                condition_description=data.get("purpose", "Pending"),
                urgency_level=data.get("urgency_level", "Moderate"),
                relation_to_patient="Self",
            )
            db.session.add(patient)
            db.session.flush()
    elif user.role == "blood_bank":
        blood_bank = BloodBank.query.filter_by(user_id=user.id).first()
        if blood_bank is None:
            return {"message": "Blood bank profile not found."}, 404
        if blood_bank.status != "approved":
            return {"message": "Blood bank is not approved yet."}, 403

    try:
        required_before = datetime.strptime(data["required_before"], "%Y-%m-%d")
    except (ValueError, TypeError):
        return {"errors": {"required_before": "Invalid date format. Use YYYY-MM-DD."}}, 400

    urgency_str = data.get("urgency_level", "Moderate")
    try:
        urgency_level = UrgencyLevel(urgency_str)
    except ValueError:
        return {"errors": {"urgency_level": "Invalid urgency level."}}, 400

    request = BloodRequest(
        created_by=user.id,
        patient_id=patient.id if patient else None,
        blood_bank_id=blood_bank.id if blood_bank else None,
        blood_group=data["blood_group"],
        units=int(data["units"]),
        hospital=data["hospital"],
        hospital_address=data["hospital_address"],
        city=data["city"],
        urgency_level=urgency_level,
        required_before=required_before,
        purpose=data.get("purpose"),
        contact_name=data["contact_name"],
        contact_phone=data["contact_phone"],
    )

    db.session.add(request)
    db.session.flush()

    matching_donors = (
        Donor.query
        .filter_by(
            blood_group=request.blood_group,
            available=True,
            is_eligible=True
        )
        .all()
    )

    for donor in matching_donors:
        if not donor.user or donor.user.city != request.city:
            continue
        create_notification(
            user_id=donor.user_id,
            title="New Blood Request",
            message=(
                f"A new {request.blood_group} blood request "
                f"is available in {request.city}."
            ),
            notification_type="blood_request",
            reference_id=request.id
        )

    blood_banks = BloodBank.query.filter_by(status="approved").all()
    for bank in blood_banks:
        if not db.session.get(User, bank.user_id):
            continue
        create_notification(
            user_id=bank.user_id,
            title="New Blood Request",
            message=(
                f"A new {request.blood_group} blood request "
                f"is available in {request.city}."
            ),
            notification_type="blood_request",
            reference_id=request.id
        )

    admins = User.query.filter_by(role="admin").all()
    for admin in admins:
        create_notification(
            user_id=admin.id,
            title="New Blood Request",
            message=(
                f"A new {request.blood_group} blood request "
                f"has been raised in {request.city}."
            ),
            notification_type="blood_request",
            reference_id=request.id
        )

    db.session.commit()
    return {"message": "Blood request created successfully.", "request_id": request.id}, 201

def get_my_requests():
    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if user is None:
        return {
            "message": "User not found."
        }, 404

    requests = (
        BloodRequest.query
        .filter_by(created_by=user.id)
        .order_by(BloodRequest.created_at.desc())
        .all()
    )

    data = []

    for request in requests:
        accepted_count = Donation.query.filter_by(
            blood_request_id=request.id,
            status=DonationStatus.ACCEPTED
        ).count()

        item = {
            "id": request.id,
            "blood_group": request.blood_group,
            "units": request.units,
            "hospital": request.hospital,
            "hospital_address": request.hospital_address,
            "city": request.city,
            "urgency_level": request.urgency_level.value,
            "required_before": request.required_before.isoformat(),
            "purpose": request.purpose,
            "contact_name": request.contact_name,
            "contact_phone": request.contact_phone,
            "fulfilled_units": request.fulfilled_units,
            "status": request.status.value,
            "created_at": request.created_at.isoformat(),
            "accepted_count": accepted_count,
        }

        if user.role == "patient":
            donations = (
                Donation.query
                .filter_by(blood_request_id=request.id, status=DonationStatus.ACCEPTED)
                .all()
            )
            item["accepted_donors"] = [
                {
                    "donation_id": d.id,
                    "donor_id": d.donor.id,
                    "name": f"{d.donor.user.first_name} {d.donor.user.last_name}" if d.donor.user else "Unknown",
                    "blood_group": d.donor.blood_group,
                    "phone": d.donor.user.phone if d.donor.user else "",
                    "city": d.donor.user.city if d.donor.user else "",
                    "status": d.status.value,
                    "donated_units": d.donated_units,
                    "accepted_at": d.accepted_at.isoformat() if d.accepted_at else None,
                }
                for d in donations if d.donor
            ]

        data.append(item)

    return {
        "blood_requests": data
    }, 200
    
def get_open_requests():
    requests = (
        BloodRequest.query
        .filter_by(status=RequestStatus.PENDING)
        .all()
    )

    data = []
    for req in requests:
        accepted_count = Donation.query.filter_by(
            blood_request_id=req.id,
            status=DonationStatus.ACCEPTED
        ).count()

        data.append({
            "id": req.id,
            "blood_group": req.blood_group,
            "units": req.units,
            "hospital": req.hospital,
            "city": req.city,
            "urgency_level": req.urgency_level.value,
            "required_before": req.required_before.isoformat(),
            "status": req.status.value,
            "created_at": req.created_at.isoformat(),
            "accepted_count": accepted_count,
        })

    def sort_key(r):
        urgency = URGENCY_ORDER.get(r["urgency_level"], 99)
        created = r.get("created_at") or ""
        try:
            ts = datetime.fromisoformat(created).timestamp()
        except Exception:
            ts = 0
        return (urgency, -ts)

    data.sort(key=sort_key)

    return {"blood_requests": data}, 200


def get_accepted_donors(request_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if user is None:
        return {"message": "User not found."}, 404

    blood_request = db.session.get(BloodRequest, request_id)
    if blood_request is None:
        return {"message": "Blood request not found."}, 404

    if blood_request.created_by != user.id and user.role != "admin":
        return {"message": "Unauthorized access."}, 403

    donations = (
        Donation.query
        .filter_by(blood_request_id=request_id, status=DonationStatus.ACCEPTED)
        .all()
    )

    donors = []
    for donation in donations:
        donor = donation.donor
        if donor and donor.user:
            donors.append({
                "donor_id": donor.id,
                "name": f"{donor.user.first_name} {donor.user.last_name}",
                "blood_group": donor.blood_group,
                "phone": donor.user.phone,
                "city": donor.user.city,
                "accepted_at": donation.accepted_at.isoformat() if donation.accepted_at else None,
            })

    return {"donors": donors, "total": len(donors)}, 200


def get_request_by_id(request_id):
    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if user is None:
        return {
            "message": "User not found."
        }, 404

    blood_request = db.session.get(
        BloodRequest,
        request_id
    )

    if blood_request is None:
        return {
            "message": "Blood request not found."
        }, 404

    if blood_request.created_by != user.id:
        return {
            "message": "Unauthorized access."
        }, 403

    return {
        "blood_request": {
            "id": blood_request.id,
            "blood_group": blood_request.blood_group,
            "units": blood_request.units,
            "hospital": blood_request.hospital,
            "hospital_address": blood_request.hospital_address,
            "city": blood_request.city,
            "urgency_level": blood_request.urgency_level.value,
            "required_before": (
                blood_request.required_before.isoformat()
            ),
            "purpose": blood_request.purpose,
            "contact_name": blood_request.contact_name,
            "contact_phone": blood_request.contact_phone,
            "fulfilled_units": blood_request.fulfilled_units,
            "status": blood_request.status.value,
            "created_at": (
                blood_request.created_at.isoformat()
            ),
            "updated_at": (
                blood_request.updated_at.isoformat()
            )
        }
    }, 200


def update_blood_request(request_id, data):
    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if user is None:
        return {
            "message": "User not found."
        }, 404

    blood_request = db.session.get(
        BloodRequest,
        request_id
    )

    if blood_request is None:
        return {
            "message": "Blood request not found."
        }, 404

    if blood_request.created_by != user.id:
        return {
            "message": "Unauthorized access."
        }, 403

    if blood_request.status in (
        RequestStatus.COMPLETED,
        RequestStatus.CANCELLED
    ):
        return {
            "message": "This request cannot be updated."
        }, 400

    blood_request.blood_group = data.get(
        "blood_group",
        blood_request.blood_group
    )

    blood_request.units = data.get(
        "units",
        blood_request.units
    )

    blood_request.hospital = data.get(
        "hospital",
        blood_request.hospital
    )

    blood_request.hospital_address = data.get(
        "hospital_address",
        blood_request.hospital_address
    )

    blood_request.city = data.get(
        "city",
        blood_request.city
    )

    if "urgency_level" in data:
        try:
            blood_request.urgency_level = UrgencyLevel(data["urgency_level"])
        except ValueError:
            return {"errors": {"urgency_level": "Invalid urgency level."}}, 400

    if "required_before" in data:
        try:
            blood_request.required_before = datetime.strptime(
                data["required_before"], "%Y-%m-%d"
            )
        except (ValueError, TypeError):
            return {"errors": {"required_before": "Invalid date format. Use YYYY-MM-DD."}}, 400

    blood_request.purpose = data.get(
        "purpose",
        blood_request.purpose
    )

    blood_request.contact_name = data.get(
        "contact_name",
        blood_request.contact_name
    )

    blood_request.contact_phone = data.get(
        "contact_phone",
        blood_request.contact_phone
    )

    db.session.commit()

    return {
        "message": "Blood request updated successfully."
    }, 200


def cancel_blood_request(request_id):
    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if user is None:
        return {
            "message": "User not found."
        }, 404

    blood_request = db.session.get(
        BloodRequest,
        request_id
    )

    if blood_request is None:
        return {
            "message": "Blood request not found."
        }, 404

    if blood_request.created_by != user.id:
        return {
            "message": "Unauthorized access."
        }, 403

    if blood_request.status == RequestStatus.CANCELLED:
        return {
            "message": "Blood request is already cancelled."
        }, 400

    if blood_request.status == RequestStatus.COMPLETED:
        return {
            "message": "Completed requests cannot be cancelled."
        }, 400

    blood_request.status = RequestStatus.CANCELLED

    db.session.commit()

    return {
        "message": "Blood request cancelled successfully."
    }, 200
    

def patient_update_request_status(request_id, data):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if user is None:
        return {"message": "User not found."}, 404

    if user.role != "patient":
        return {"message": "Only patients can perform this action."}, 403

    blood_request = db.session.get(BloodRequest, request_id)
    if blood_request is None:
        return {"message": "Blood request not found."}, 404

    if blood_request.created_by != user.id:
        return {"message": "Unauthorized access."}, 403

    if blood_request.status != RequestStatus.PENDING:
        return {"message": "This request cannot be updated in its current state."}, 400

    action = data.get("action")
    if action not in ("fulfilled", "not_fulfilled"):
        return {"message": "Invalid action. Use 'fulfilled' or 'not_fulfilled'."}, 400

    accepted_donations = Donation.query.filter_by(
        blood_request_id=blood_request.id,
        status=DonationStatus.ACCEPTED
    ).all()

    if not accepted_donations:
        return {"message": "No donors have accepted this request yet."}, 400

    if action == "fulfilled":
        blood_request.status = RequestStatus.COMPLETED
        blood_request.fulfilled_units = blood_request.units

        for donation in accepted_donations:
            donation.status = DonationStatus.VERIFIED
            donation.donated_units = 1
            donation.verified_at = datetime.utcnow()

            if donation.donor and donation.donor.user:
                donor_name = f"{donation.donor.user.first_name} {donation.donor.user.last_name}"
                create_notification(
                    user_id=donation.donor.user_id,
                    title="Donation Verified",
                    message=f"Your donation for {blood_request.blood_group} request at {blood_request.hospital} has been marked as fulfilled.",
                    notification_type="donation_verified",
                    reference_id=donation.id
                )

        create_notification(
            user_id=blood_request.created_by,
            title="Blood Request Completed",
            message=f"Your {blood_request.blood_group} blood request has been marked as fulfilled!",
            notification_type="blood_request_completed",
            reference_id=blood_request.id
        )

    elif action == "not_fulfilled":
        for donation in accepted_donations:
            donation.status = DonationStatus.CANCELLED

            if donation.donor and donation.donor.user:
                donor_name = f"{donation.donor.user.first_name} {donation.donor.user.last_name}"
                create_notification(
                    user_id=donation.donor.user_id,
                    title="Donation Not Fulfilled",
                    message=f"The patient marked your acceptance for {blood_request.blood_group} request at {blood_request.hospital} as not fulfilled.",
                    notification_type="donation_cancelled",
                    reference_id=donation.id
                )

    db.session.commit()

    return {
        "message": f"Blood request marked as {action} successfully.",
        "status": blood_request.status.value
    }, 200


def get_matching_donors(request_id):

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if user is None:
        return {
            "message": "User not found."
        }, 404

    blood_request = db.session.get(
        BloodRequest,
        request_id
    )

    if blood_request is None:
        return {
            "message": "Blood request not found."
        }, 404

    # Only request owner or admin
    if (
        user.role != "admin"
        and blood_request.created_by != user.id
    ):
        return {
            "message": "Unauthorized access."
        }, 403

    donors = (
        Donor.query
        .filter_by(
            blood_group=blood_request.blood_group,
            available=True,
            is_eligible=True
        )
        .all()
    )

    result = []

    for donor in donors:
        if not donor.user:
            continue

        if donor.user.city != blood_request.city:
            continue

        result.append({
            "donor_id": donor.id,
            "name": f"{donor.user.first_name} {donor.user.last_name}",
            "blood_group": donor.blood_group,
            "city": donor.user.city,
            "phone": donor.user.phone
        })

    return {
        "matching_donors": result,
        "total_matches": len(result)
    }, 200