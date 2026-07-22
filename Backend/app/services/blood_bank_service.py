from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.blood_bank import BloodBank
from app.models.inventory import Inventory, InventoryStatus
from sqlalchemy import func
from app.models.blood_request import BloodRequest, RequestStatus
from app.utils.helpers import create_notification

def register_blood_bank(data):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({
            "message": "User not found."
    }), 404
    existing_bank = BloodBank.query.filter_by(user_id=user.id).first()

    if existing_bank:
        return jsonify({
            "message": "Blood bank profile already exists."
        }), 400

    blood_bank = BloodBank(
    user_id=user.id,
    facility_name=data.get("facility_name"),
    contact_person=data.get("contact_person"),
    address=data.get("address"),
    operating_hours=data.get("operating_hours"),
    available_24x7=data.get(
        "available_24x7",
        False
    ),
    website=data.get("website")
)
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
    blood_bank.address = data.get(
        "address",
        blood_bank.address
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