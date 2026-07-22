from datetime import datetime, timedelta
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

    # Validate screening was completed and passed
    if not donor.screening_completed or donor.screening_result != "passed":
        return {
            "message": "You must complete the eligibility screening before accepting a request."
        }, 400

    # Validate donation interval on backend
    eligible_interval, _ = donor.check_donation_interval()
    if not eligible_interval:
        return {
            "message": "You are not eligible due to donation interval. A minimum of 56 days is required since your last donation."
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
    
def verify_fulfillment(donation_id, data):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if user is None:
        return {"message": "User not found."}, 404

    donation = db.session.get(Donation, donation_id)
    if donation is None:
        return {"message": "Donation not found."}, 404

    blood_request = donation.blood_request
    if blood_request.created_by != user.id:
        return {"message": "Unauthorized access."}, 403

    if donation.status != DonationStatus.ACCEPTED:
        return {"message": "Donation is not in accepted state."}, 400

    donated_units = data.get("donated_units")
    if donated_units is None or donated_units <= 0:
        return {"message": "Invalid donated units."}, 400

    remaining = blood_request.units - blood_request.fulfilled_units
    if donated_units > remaining:
        return {"message": f"Only {remaining} unit(s) still required."}, 400

    donation.donated_units = donated_units
    donation.status = DonationStatus.VERIFIED
    donation.verified_at = datetime.utcnow()
    blood_request.fulfilled_units += donated_units

    completed = False
    if blood_request.fulfilled_units >= blood_request.units:
        blood_request.status = RequestStatus.COMPLETED
        completed = True

    donor_name = f"{donation.donor.user.first_name} {donation.donor.user.last_name}"
    create_notification(
        user_id=donation.donor.user_id,
        title="Donation Verified",
        message=f"{user.first_name} {user.last_name} confirmed your donation of {donated_units} unit(s) for request #{blood_request.id}.",
        notification_type="donation_verified",
        reference_id=donation.id
    )

    if completed:
        create_notification(
            user_id=blood_request.created_by,
            title="Blood Request Completed",
            message=f"Your {blood_request.blood_group} blood request has been fulfilled!",
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
