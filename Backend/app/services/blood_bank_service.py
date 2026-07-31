from datetime import datetime
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.blood_bank import BloodBank
from app.models.donation import Donation, DonationStatus
from app.models.inventory import Inventory, InventoryStatus
from sqlalchemy import func
from app.models.blood_request import BloodRequest, RequestStatus
from app.utils.helpers import create_notification
from app.services.geocoding_service import geocode_address

def register_blood_bank(data):
    email = data.get("email")
    if not email:
        return jsonify({"message": "Email is required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found with this email."}), 404

    existing_bank = BloodBank.query.filter_by(user_id=user.id).first()
    if existing_bank:
        return jsonify({
            "message": "Blood bank profile already exists."
        }), 400

    blood_bank = BloodBank(
    user_id=user.id,
    facility_name=data.get("facility_name"),
    license_id=data.get("license_id"),
    contact_person=data.get("contact_person"),
    address=data.get("address"),
    operating_hours=data.get("operating_hours"),
    available_24x7=data.get(
        "available_24x7",
        False
    ),
    website=data.get("website"),
)

    explicit_lat = data.get("lat") or data.get("latitude")
    explicit_lng = data.get("lng") or data.get("longitude")

    if explicit_lat is not None and explicit_lng is not None:
        blood_bank.latitude = explicit_lat
        blood_bank.longitude = explicit_lng
    else:
        result = geocode_address(blood_bank.address)
        if result is not None:
            blood_bank.latitude, blood_bank.longitude = result
    db.session.add(blood_bank)
    db.session.commit()
    
    return jsonify({
    "message": "Blood bank registered successfully. Waiting for admin verification."
}), 201
    

def get_blood_bank_profile():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "message": "User not found."
        }), 404

    blood_bank = BloodBank.query.filter_by(
        user_id=user.id
    ).first()

    if not blood_bank:
        return jsonify({
            "message": "Blood bank profile not found."
        }), 404

    return jsonify({
        "id": blood_bank.id,
        "user_id": blood_bank.user_id,
        "facility_name": blood_bank.facility_name,
        "verification_status": blood_bank.status,
        "verified_at": blood_bank.verified_at,
        "rejection_reason": blood_bank.rejection_reason,
        "contact_person": blood_bank.contact_person,
        "address": blood_bank.address,
        "latitude": blood_bank.latitude,
        "longitude": blood_bank.longitude,
        "operating_hours": blood_bank.operating_hours,
        "available_24x7": blood_bank.available_24x7,
        "website": blood_bank.website,
        "created_at": blood_bank.created_at,
        "updated_at": blood_bank.updated_at
    }), 200


def update_blood_bank_profile(data):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "message": "User not found."
        }), 404

    blood_bank = BloodBank.query.filter_by(
        user_id=user.id
    ).first()

    if not blood_bank:
        return jsonify({
            "message": "Blood bank profile not found."
        }), 404

    blood_bank.facility_name = data.get(
        "facility_name",
        blood_bank.facility_name
    )
    blood_bank.contact_person = data.get(
        "contact_person",
        blood_bank.contact_person
    )
    blood_bank.operating_hours = data.get(
        "operating_hours",
        blood_bank.operating_hours
    )
    blood_bank.website = data.get(
        "website",
        blood_bank.website
    )
    blood_bank.available_24x7 = data.get(
        "available_24x7",
        blood_bank.available_24x7
    )

    incoming_address = data.get("address")
    address_changed = (
        incoming_address is not None and
        incoming_address != blood_bank.address
    )
    if address_changed:
        blood_bank.address = incoming_address

    explicit_lat = data.get("lat") or data.get("latitude")
    explicit_lng = data.get("lng") or data.get("longitude")

    if explicit_lat is not None and explicit_lng is not None:
        blood_bank.latitude = explicit_lat
        blood_bank.longitude = explicit_lng
    elif address_changed:
        result = geocode_address(blood_bank.address)
        if result is not None:
            blood_bank.latitude, blood_bank.longitude = result

    db.session.commit()

    return jsonify({
        "message": "Blood bank profile updated successfully."
    }), 200
    


def blood_bank_dashboard():

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if user is None:
        return {
            "message": "User not found."
        }, 404

    blood_bank = BloodBank.query.filter_by(
        user_id=user.id
    ).first()

    if blood_bank is None:
        return {
            "message": "Blood bank profile not found."
        }, 404

    requests = BloodRequest.query.filter_by(
        blood_bank_id=blood_bank.id
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
        .filter(
            BloodRequest.blood_bank_id == blood_bank.id
        )
        .scalar()
    )

    total_units_fulfilled = (
        db.session.query(
            func.coalesce(
                func.sum(BloodRequest.fulfilled_units),
                0
            )
        )
        .filter(
            BloodRequest.blood_bank_id == blood_bank.id
        )
        .scalar()
    )

    return {
        "verification_status":
            blood_bank.status,

        "total_requests":
            total_requests,

        "active_requests":
            active_requests,

        "completed_requests":
            completed_requests,

        "total_units_requested":
            total_units_requested,

        "total_units_fulfilled":
            total_units_fulfilled
    }, 200


def accept_request_as_donor(request_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if user is None:
        return {"message": "User not found."}, 404

    blood_bank = BloodBank.query.filter_by(user_id=user.id).first()
    if blood_bank is None:
        return {"message": "Blood bank profile not found."}, 404
    if blood_bank.status != "approved":
        return {"message": "Blood bank is not approved yet."}, 403

    blood_request = db.session.get(BloodRequest, request_id)
    if blood_request is None:
        return {"message": "Blood request not found."}, 404
    if blood_request.status != RequestStatus.PENDING:
        return {"message": "This request is no longer accepting responses."}, 400

    if blood_request.created_by == user.id:
        return {"message": "You cannot accept your own blood request."}, 400

    existing = Donation.query.filter_by(
        blood_bank_id=blood_bank.id,
        blood_request_id=blood_request.id
    ).first()
    if existing:
        return {"message": "You have already responded to this request."}, 400

    donation = Donation(
        blood_bank_id=blood_bank.id,
        blood_request_id=blood_request.id,
        status=DonationStatus.ACCEPTED,
        accepted_at=datetime.utcnow()
    )
    db.session.add(donation)
    db.session.flush()

    create_notification(
        user_id=blood_request.created_by,
        title="Blood Bank Accepted Request",
        message=(
            f"{blood_bank.facility_name} has accepted your "
            f"{blood_request.blood_group} blood request."
        ),
        notification_type="donation_acceptance",
        reference_id=donation.id
    )

    db.session.commit()

    return {
        "message": "Blood request accepted successfully.",
        "donation_id": donation.id
    }, 201


def get_accepted_requests():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if user is None:
        return {"message": "User not found."}, 404

    blood_bank = BloodBank.query.filter_by(user_id=user.id).first()
    if blood_bank is None:
        return {"message": "Blood bank profile not found."}, 404

    donations = (
        Donation.query
        .filter_by(blood_bank_id=blood_bank.id)
        .join(BloodRequest)
        .filter(
            BloodRequest.status.in_([
                RequestStatus.PENDING,
                RequestStatus.COMPLETED
            ])
        )
        .order_by(Donation.accepted_at.desc())
        .all()
    )

    data = []
    for donation in donations:
        req = donation.blood_request
        if req is None:
            continue
        fulfilled = req.status == RequestStatus.COMPLETED
        data.append({
            "id": donation.id,
            "blood_request_id": req.id,
            "blood_group": req.blood_group,
            "units": req.units,
            "hospital": req.hospital,
            "city": req.city,
            "urgency_level": req.urgency_level.value,
            "required_before": req.required_before.isoformat(),
            "contact_name": req.contact_name,
            "contact_phone": req.contact_phone,
            "fulfilled_units": req.fulfilled_units,
            "fulfilled": fulfilled,
            "status": req.status.value,
            "accepted_at": donation.accepted_at.isoformat() if donation.accepted_at else None,
        })

    return {"accepted_requests": data}, 200


def fulfill_request(request_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if user is None:
        return {"message": "User not found."}, 404

    blood_bank = BloodBank.query.filter_by(user_id=user.id).first()
    if blood_bank is None:
        return {"message": "Blood bank profile not found."}, 404
    if blood_bank.status != "approved":
        return {"message": "Blood bank is not approved yet."}, 403

    blood_request = db.session.get(BloodRequest, request_id)
    if blood_request is None:
        return {"message": "Blood request not found."}, 404
    if blood_request.status != RequestStatus.PENDING:
        return {"message": "Request is no longer accepting fulfillment."}, 400

    if blood_request.created_by == user.id:
        return {"message": "You cannot fulfill your own blood request."}, 400

    blood_request.blood_bank_id = blood_bank.id

    existing = Inventory.query.filter_by(
        blood_bank_id=blood_bank.id,
        blood_group=blood_request.blood_group
    ).first()

    if not existing or existing.units < blood_request.units:
        available = existing.units if existing else 0
        return {
            "message": f"Insufficient inventory. Only {available} unit(s) of {blood_request.blood_group} available."
        }, 400

    existing.units -= blood_request.units
    if existing.units == 0:
        existing.status = InventoryStatus.OUT_OF_STOCK
    elif existing.units <= 5:
        existing.status = InventoryStatus.LOW_STOCK
    else:
        existing.status = InventoryStatus.AVAILABLE

    blood_request.fulfilled_units = blood_request.units
    blood_request.status = RequestStatus.COMPLETED

    create_notification(
        user_id=blood_request.created_by,
        title="Blood Request Fulfilled",
        message=(
            f"Your {blood_request.blood_group} request has been fulfilled "
            f"by {blood_bank.facility_name}."
        ),
        notification_type="blood_request_completed",
        reference_id=blood_request.id
    )

    db.session.commit()

    return {
        "message": "Blood request fulfilled successfully from inventory."
    }, 200