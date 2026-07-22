from flask import jsonify
from datetime import datetime
from app.extensions import db
from app.models.user import User
from app.models.blood_bank import BloodBank
from app.models.donor import Donor
from app.models.patient import Patient
from app.models.donation import Donation, DonationStatus
from app.models.blood_request import (
    BloodRequest,
    RequestStatus)
from app.models.inventory import Inventory, InventoryStatus
from app.models.camp import Camp
from app.utils.helpers import create_notification
from app.services.geocoding_service import geocode_address
from datetime import date


def get_all_blood_banks():
    blood_banks = BloodBank.query.all()

    result = []

    for blood_bank in blood_banks:
        user = db.session.get(
            User,
            blood_bank.user_id
        )

        result.append({
            "id": blood_bank.id,
            "facility_name": blood_bank.facility_name,
            "contact_person": blood_bank.contact_person,
            "verification_status": blood_bank.status,
            "city": user.city,
            "email": user.email,
            "phone": user.phone
        })
    return jsonify({
        "blood_banks": result
    }), 200

def get_blood_bank_by_id(blood_bank_id):
    blood_bank = db.session.get(
        BloodBank,
        blood_bank_id
    )
    if blood_bank is None:
        return jsonify({
            "message": "Blood bank not found."
        }), 404

    user = blood_bank.user

    return jsonify({
        "blood_bank": {
            "id": blood_bank.id,
            "facility_name": blood_bank.facility_name,
            "verification_status": blood_bank.status,
            "verified_at": (
                blood_bank.verified_at.isoformat()
                if blood_bank.verified_at
                else None
            ),
            "rejection_reason": blood_bank.rejection_reason,
            "contact_person": blood_bank.contact_person,
            "address": blood_bank.address,
            "operating_hours": blood_bank.operating_hours,
            "available_24x7": blood_bank.available_24x7,
            "website": blood_bank.website,
            "created_at": blood_bank.created_at.isoformat(),
            "updated_at": blood_bank.updated_at.isoformat(),

            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone": user.phone,
                "city": user.city,
                "address": user.address
            }
        }
    }), 200

def approve_blood_bank(blood_bank_id):
    blood_bank = db.session.get(
        BloodBank,
        blood_bank_id
    )
    if blood_bank is None:
        return jsonify({
            "message": "Blood bank not found."
        }), 404
    if blood_bank.status == "approved":
        return jsonify({
            "message": "Blood bank is already approved."
        }), 400
    blood_bank.status = "approved"
    blood_bank.verified_at = datetime.utcnow()
    blood_bank.rejection_reason = None

    if blood_bank.latitude is None or blood_bank.longitude is None:
        result = geocode_address(blood_bank.address)
        if result is not None:
            blood_bank.latitude, blood_bank.longitude = result

    create_notification(
        user_id=blood_bank.user_id,
        title="Blood Bank Approved",
        message=(
            "Your blood bank has been approved by admin."
        ),
        notification_type="blood_bank_approval",
        reference_id=blood_bank.id
    )

    db.session.commit()

    return jsonify({
        "message": "Blood bank approved successfully."
    }), 200

def reject_blood_bank(blood_bank_id, data):
    blood_bank = db.session.get(
        BloodBank,
        blood_bank_id
    )
    if blood_bank is None:
        return jsonify({
            "message": "Blood bank not found."
        }), 404

    rejection_reason = data.get("rejection_reason")

    if not rejection_reason:
        return jsonify({
            "message": "Rejection reason is required."
        }), 400
    if blood_bank.status == "rejected":
        return jsonify({
            "message": "Blood bank is already rejected."
        }), 400

    blood_bank.status = "rejected"
    blood_bank.verified_at = None
    blood_bank.rejection_reason = rejection_reason

    create_notification(
        user_id=blood_bank.user_id,
        title="Blood Bank Rejected",
        message=(
            "Your blood bank registration has been rejected by admin. "
            f"Reason: {rejection_reason}"
        ),
        notification_type="blood_bank_rejection",
        reference_id=blood_bank.id
    )

    db.session.commit()

    return jsonify({
        "message": "Blood bank rejected successfully."
    }), 200

def get_all_blood_requests():
    requests = (
        BloodRequest.query
        .order_by(BloodRequest.created_at.desc())
        .all()
    )
    result = []
    for request in requests:
        result.append({
            "id": request.id,
            "blood_group": request.blood_group,
            "units": request.units,
            "hospital": request.hospital,
            "city": request.city,
            "urgency_level": request.urgency_level.value,
            "status": request.status.value,
            "created_by": request.created_by,
            "created_at": request.created_at.isoformat()
        })
    return {
        "blood_requests": result
    }, 200

def get_blood_request_by_id(request_id):
    blood_request = db.session.get(
        BloodRequest,
        request_id
    )
    if blood_request is None:
        return {
            "message": "Blood request not found."
        }, 404
    return {
        "blood_request": {
            "id": blood_request.id,
            "created_by": blood_request.created_by,
            "patient_id": blood_request.patient_id,
            "blood_bank_id": blood_request.blood_bank_id,
            "blood_group": blood_request.blood_group,
            "units": blood_request.units,
            "fulfilled_units": blood_request.fulfilled_units,
            "hospital": blood_request.hospital,
            "hospital_address": blood_request.hospital_address,
            "city": blood_request.city,
            "urgency_level": blood_request.urgency_level.value,
            "required_before": blood_request.required_before.isoformat(),
            "purpose": blood_request.purpose,
            "contact_name": blood_request.contact_name,
            "contact_phone": blood_request.contact_phone,
            "status": blood_request.status.value,
            "created_at": blood_request.created_at.isoformat(),
            "updated_at": blood_request.updated_at.isoformat()
        }
    }, 200
    
def complete_blood_request(request_id):
    blood_request = db.session.get(
        BloodRequest,
        request_id
    )
    if blood_request is None:
        return {
            "message": "Blood request not found."
        }, 404
    if blood_request.status == RequestStatus.COMPLETED:
        return {
            "message": "Blood request is already completed."
        }, 400
    if blood_request.status == RequestStatus.CANCELLED:
        return {
            "message": "Cancelled requests cannot be completed."
        }, 400
    if blood_request.fulfilled_units < blood_request.units:
        return {
            "message": "Required blood units have not been fulfilled yet."
        }, 400
    blood_request.status = RequestStatus.COMPLETED

    blood_bank = blood_request.blood_bank
    if blood_bank:
        existing = Inventory.query.filter_by(
            blood_bank_id=blood_bank.id,
            blood_group=blood_request.blood_group
        ).first()
        if existing:
            deduction = min(blood_request.fulfilled_units, existing.units)
            existing.units -= deduction
            if existing.units == 0:
                existing.status = InventoryStatus.OUT_OF_STOCK
            elif existing.units <= 5:
                existing.status = InventoryStatus.LOW_STOCK
            else:
                existing.status = InventoryStatus.AVAILABLE

    create_notification(
        user_id=blood_request.created_by,
        title="Blood Request Completed",
        message=(
            f"Your {blood_request.blood_group} blood request has been completed."
        ),
        notification_type="blood_request_completed",
        reference_id=blood_request.id
    )

    db.session.commit()

    return {
        "message": "Blood request marked as completed."
    }, 200
    
from app.models.donation import Donation


def get_all_donations():

    donations = (
        Donation.query
        .order_by(Donation.created_at.desc())
        .all()
    )

    result = []

    for donation in donations:

        donor = donation.donor
        request = donation.blood_request

        result.append({
            "donation_id": donation.id,
            "request_id": request.id,
            "donor_id": donor.id,
            "blood_group": request.blood_group,
            "hospital": request.hospital,
            "city": request.city,
            "status": donation.status.value,
            "donated_units": donation.donated_units,
            "accepted_at": donation.accepted_at.isoformat() if donation.accepted_at else None,
            "verified_at": donation.verified_at.isoformat() if donation.verified_at else None,
            "created_at": donation.created_at.isoformat()
        })

    return {
        "donations": result
    }, 200
    
def get_donation_by_id(donation_id):

    donation = db.session.get(
        Donation,
        donation_id
    )

    if donation is None:
        return {
            "message": "Donation not found."
        }, 404

    request = donation.blood_request
    donor = donation.donor

    return {
        "donation": {
            "id": donation.id,
            "request_id": request.id,
            "donor_id": donor.id,
            "status": donation.status.value,
            "donated_units": donation.donated_units,
            "accepted_at": donation.accepted_at.isoformat() if donation.accepted_at else None,
            "donated_at": donation.donated_at.isoformat() if donation.donated_at else None,
            "verified_at": donation.verified_at.isoformat() if donation.verified_at else None,
            "remarks": donation.remarks,
            "created_at": donation.created_at.isoformat()
        }
    }, 200

def verify_donation(donation_id, data):

    donation = db.session.get(
        Donation,
        donation_id
    )

    if donation is None:
        return {
            "message": "Donation not found."
        }, 404

    if donation.status == DonationStatus.VERIFIED:
        return {
            "message": "Donation already verified."
        }, 400

    if donation.status == DonationStatus.CANCELLED:
        return {
            "message": "Cancelled donation cannot be verified."
        }, 400

    donated_units = data.get("donated_units")

    if donated_units is None or donated_units <= 0:
        return {
            "message": "Invalid donated units."
        }, 400

    blood_request = donation.blood_request

    remaining_units = (
        blood_request.units -
        blood_request.fulfilled_units
    )

    if donated_units > remaining_units:
        return {
            "message": (
                f"Only {remaining_units} unit(s) "
                "are still required."
            )
        }, 400

    donation.donated_units = donated_units
    donation.status = DonationStatus.VERIFIED
    donation.verified_at = datetime.utcnow()

    blood_request.fulfilled_units += donated_units

    completed = False
    if blood_request.fulfilled_units >= blood_request.units:
        blood_request.status = RequestStatus.COMPLETED
        completed = True

    blood_bank = blood_request.blood_bank
    if blood_bank:
        existing = Inventory.query.filter_by(
            blood_bank_id=blood_bank.id,
            blood_group=blood_request.blood_group
        ).first()
        if existing:
            existing.units += donated_units
            if existing.units <= 5:
                existing.status = InventoryStatus.LOW_STOCK
            else:
                existing.status = InventoryStatus.AVAILABLE
        else:
            inventory = Inventory(
                blood_bank_id=blood_bank.id,
                blood_group=blood_request.blood_group,
                units=donated_units,
                collection_date=datetime.utcnow().date(),
                expiry_date=datetime.utcnow().date(),
                status=InventoryStatus.AVAILABLE,
            )
            db.session.add(inventory)

    create_notification(
        user_id=donation.donor.user_id,
        title="Donation Verified",
        message=(
            f"Your donation for request {blood_request.id} has been verified."
        ),
        notification_type="donation_verified",
        reference_id=donation.id
    )

    if completed:
        create_notification(
            user_id=blood_request.created_by,
            title="Blood Request Completed",
            message=(
                f"Your {blood_request.blood_group} blood request has been completed."
            ),
            notification_type="blood_request_completed",
            reference_id=blood_request.id
        )

    db.session.commit()

    return {
        "message": "Donation verified successfully.",
        "fulfilled_units": blood_request.fulfilled_units,
        "required_units": blood_request.units,
        "request_status": blood_request.status.value
    }, 200
    
def reject_donation(donation_id, data):
    donation = db.session.get(
        Donation,
        donation_id
    )
    if donation is None:
        return {
            "message": "Donation not found."
        }, 404
    if donation.status == DonationStatus.VERIFIED:
        return {
            "message": "Verified donation cannot be rejected."
        }, 400
    if donation.status == DonationStatus.REJECTED:
        return {
            "message": "Donation already rejected."
        }, 400
    reason = data.get("rejection_reason")
    if not reason:
        return {
            "message": "Rejection reason is required."
        }, 400
    donation.status = DonationStatus.REJECTED
    donation.rejection_reason = reason
    db.session.commit()
    return {
        "message": "Donation rejected successfully."
    }, 200
    
def get_all_camps():
    camps = Camp.query.order_by(Camp.date.desc()).all()
    result = []
    for c in camps:
        item = c.to_dict()
        item["blood_bank_name"] = c.blood_bank.facility_name if c.blood_bank else None
        result.append(item)
    return {"camps": result}, 200


def admin_dashboard():

    return {
        "total_users": User.query.count(),

        "total_donors": Donor.query.count(),

        "total_patients": Patient.query.count(),

        "total_blood_banks": BloodBank.query.count(),

        "active_requests":
            BloodRequest.query.filter(
                BloodRequest.status == RequestStatus.PENDING
            ).count(),

        "completed_requests":
            BloodRequest.query.filter(
                BloodRequest.status == RequestStatus.COMPLETED
            ).count(),

        "pending_blood_banks":
            BloodBank.query.filter(
                BloodBank.status == "pending"
            ).count(),

        "verified_donations":
            Donation.query.filter(
                Donation.status ==
                DonationStatus.VERIFIED
            ).count(),

        "pending_donations":
            Donation.query.filter(
                Donation.status ==
                DonationStatus.ACCEPTED
            ).count()
    }, 200
