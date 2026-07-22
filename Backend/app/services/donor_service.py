from app.extensions import db
from flask import jsonify
from app.models.donor import Donor
from app.models.user import User
from app.models.donation import Donation, DonationStatus
from datetime import datetime
from app.utils.helpers import get_missing_fields
from flask_jwt_extended import get_jwt_identity
from app.utils.helpers import create_notification

def register_donor(user_id, data):
    if not data:
        return {
            "message": "No JSON data received"
        },400
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({
            "message": "user not found"
        }),404
    if user.role != "donor":
        return {
            "message": "Only users with donor role can create a donor profile."
        },403
    existing_donor = Donor.query.filter_by(user_id=user.id).first()
    if existing_donor:
        return {
            "message": "Donor profile already exists."
        }, 409
    required_fields = [
    "blood_group",
    "weight"
]
    missing_fields = get_missing_fields(data, required_fields)
    if missing_fields:
        return jsonify({
            "message": "Missing required fields",
            "missing_fields": missing_fields,
        }), 400

    last_donation_date = None
    if data.get("last_donation_date"):
        try:
            last_donation_date = datetime.strptime(
                data["last_donation_date"],
                "%Y-%m-%d"
            ).date()
        except ValueError:
            return {
                "message": "Invalid date format. Use YYYY-MM-DD"
            }, 400

    new_donor = Donor(
        user_id=user.id,
        blood_group=data["blood_group"],
        weight=data["weight"],
        last_donation_date=last_donation_date,
        has_chronic_condition=data.get("has_chronic_condition", False),
        on_medication=data.get("on_medication", False),
        available=data.get("available", True),
    )
    try:
        db.session.add(new_donor)
        db.session.commit()

    except Exception as exc:
        db.session.rollback()

        return {
            "message": "Failed to create donor profile",
            "error": str(exc),
        }, 500
    return {
        "message": "Donor profile created successfully.",
        "donor": {
            "id": new_donor.id,
            "user_id": new_donor.user_id,
            "blood_group": new_donor.blood_group,
            "weight": new_donor.weight,
            "available": new_donor.available,
        },
    },201
def get_donor_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return {"message": "User not found"}, 404

    donor = Donor.query.filter_by(user_id=user.id).first()

    if not donor:
        return {"message": "Donor profile not found"}, 404

    return {
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "city": user.city,
        },
        "donor": {
            "blood_group": donor.blood_group,
            "weight": donor.weight,
            "last_donation_date": str(donor.last_donation_date)
            if donor.last_donation_date
            else None,
            "has_chronic_condition": donor.has_chronic_condition,
            "on_medication": donor.on_medication,
            "available": donor.available,
        },
    }, 200
def update_donor_profile(data):
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return {"message": "User not found"}, 404

    donor = Donor.query.filter_by(user_id=user.id).first()

    if not donor:
        return {"message": "Donor profile not found"}, 404
    if "weight" in data:
        donor.weight = data["weight"]
    if "has_chronic_condition" in data:
        donor.has_chronic_condition = data["has_chronic_condition"]
    if "on_medication" in data:
        donor.on_medication = data["on_medication"]
    if "available" in data:
        donor.available = data["available"]
    if "last_donation_date" in data:
        try:
            donor.last_donation_date = datetime.strptime(
                data["last_donation_date"],
                "%Y-%m-%d"
        ).date()
        except ValueError:
            return {
                "message": "Invalid date format. Use YYYY-MM-DD."
                }, 400
    try:
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        return {
            "message": "Failed to update donor profile",
            "error": str(exc)
        }, 500
    return {
        "message": "Donor profile updated successfully"
        }, 200
def update_availability(data):
    user_id = int(get_jwt_identity())

    user = db.session.get(User, user_id)

    if not user:
        return {"message": "User not found"}, 404
    donor = Donor.query.filter_by(user_id=user.id).first()

    if not donor:
        return {"message": "Donor profile not found"}, 404

    if "available" not in data:
        return {"message": "Available field is required"}, 400

    donor.available = data["available"]

    # Save changes
    db.session.commit()

    return {
        "message": "Availability updated successfully",
        "available": donor.available
    }, 200
def get_all_donors():
    donors = Donor.query.filter_by(available=True).all()
    donor_list = []

    for donor in donors:
        donor_data = {
            "id": donor.id,
            "first_name": donor.user.first_name,
            "last_name": donor.user.last_name,
            "blood_group": donor.blood_group,
            "city": donor.user.city,
            "weight": donor.weight,
            "available": donor.available
        }
        donor_list.append(donor_data)

    return {
        "count": len(donor_list),
        "donors": donor_list
    }, 200
    
def search_donors(blood_group):
    donors = Donor.query.filter_by(
        blood_group=blood_group,
        available=True
    ).all()

    donor_list = []

    for donor in donors:
        donor_list.append({
            "id": donor.id,
            "first_name": donor.user.first_name,
            "last_name": donor.user.last_name,
            "blood_group": donor.blood_group,
            "city": donor.user.city,
            "available": donor.available
        })

    return {
        "count": len(donor_list),
        "donors": donor_list
    }, 200
def get_donor_by_id(donor_id):
    donor = db.session.get(Donor, donor_id)
    if not donor:
        return {
            "message": "Donor not found"
        }, 404

    return {
        "id": donor.id,
        "first_name": donor.user.first_name,
        "last_name": donor.user.last_name,
        "blood_group": donor.blood_group,
        "city": donor.user.city,
        "weight": donor.weight,
        "last_donation_date": donor.last_donation_date,
        "available": donor.available,
        "has_chronic_condition": donor.has_chronic_condition,
        "on_medication": donor.on_medication
    }, 200
    
def donor_dashboard():

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if user is None:
        return {
            "message": "User not found."
        }, 404

    donor = Donor.query.filter_by(
        user_id=user.id
    ).first()

    if donor is None:
        return {
            "message": "Donor profile not found."
        }, 404

    donations = Donation.query.filter_by(
        donor_id=donor.id
    )

    return {
        "total_donations": donations.count(),

        "verified_donations":
            donations.filter(
                Donation.status ==
                DonationStatus.VERIFIED
            ).count(),

        "pending_donations":
            donations.filter(
                Donation.status ==
                DonationStatus.ACCEPTED
            ).count(),

        "cancelled_donations":
            donations.filter(
                Donation.status ==
                DonationStatus.CANCELLED
            ).count(),

        "availability": donor.available,

        "blood_group": donor.blood_group
    }, 200
