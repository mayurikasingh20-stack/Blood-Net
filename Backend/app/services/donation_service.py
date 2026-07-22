from datetime import datetime
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.donor import Donor
from app.models.donation import Donation, DonationStatus
from app.models.blood_request import BloodRequest, RequestStatus
from app.utils.helpers import create_notification

def accept_blood_request(request_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if user is None:
        return {
            "message": "User not found."
        }, 404
    donor = Donor.query.filter_by(user_id=user.id).first()

    if donor is None:
        return {
            "message": "Donor profile not found."
        }, 404

    if not donor.available:
        return {
            "message": "You are currently unavailable for donation."
        }, 400

    blood_request = db.session.get(
        BloodRequest,
        request_id
    )

    if blood_request is None:
        return {
            "message": "Blood request not found."
        }, 404

    if blood_request.status != RequestStatus.PENDING:
        return {
            "message": "This blood request is no longer accepting donors."
        }, 400

    existing = Donation.query.filter_by(
        donor_id=donor.id,
        blood_request_id=blood_request.id
    ).first()

    if existing:
        return {
            "message": "You have already responded to this request."
        }, 400

    donation = Donation(
        donor_id=donor.id,
        blood_request_id=blood_request.id,
        status=DonationStatus.ACCEPTED,
        accepted_at=datetime.utcnow()
    )

    db.session.add(donation)
    db.session.flush()

    donor_name = f"{user.first_name} {user.last_name}"
    create_notification(
        user_id=blood_request.created_by,
        title="Donation Accepted",
        message=(
            f"{donor_name} has accepted your {blood_request.blood_group} blood request."
        ),
        notification_type="donation_acceptance",
        reference_id=donation.id
    )

    db.session.commit()

    return {
        "message": "Blood request accepted successfully.",
        "donation_id": donation.id
    }, 201
    
def cancel_donation(donation_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if user is None:
        return {
            "message": "User not found."
        }, 404
    donor = Donor.query.filter_by(user_id=user.id).first()
    if donor is None:
        return {
            "message": "Donor profile not found."
        }, 404
    donation = db.session.get(
        Donation,
        donation_id
    )
    if donation is None:
        return {
            "message": "Donation not found."
        }, 404
    if donation.donor_id != donor.id:
        return {
            "message": "Unauthorized access."
        }, 403
    if donation.status == DonationStatus.CANCELLED:
        return {
            "message": "Donation is already cancelled."
        }, 400
    if donation.status == DonationStatus.VERIFIED:
        return {
            "message": "Verified donations cannot be cancelled."
        }, 400

    donation.status = DonationStatus.CANCELLED

    db.session.commit()

    return {
        "message": "Donation cancelled successfully."
    }, 200
    
def get_my_donations():

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if user is None:
        return {
            "message": "User not found."
        }, 404

    donor = Donor.query.filter_by(user_id=user.id).first()

    if donor is None:
        return {
            "message": "Donor profile not found."
        }, 404

    donations = (
        Donation.query
        .filter_by(donor_id=donor.id)
        .order_by(Donation.created_at.desc())
        .all()
    )

    result = []

    for donation in donations:

        request = donation.blood_request

        result.append({
            "donation_id": donation.id,
            "request_id": request.id,
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
