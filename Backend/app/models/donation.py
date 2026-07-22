from datetime import datetime
import enum

from app.extensions import db


class DonationStatus(enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    VERIFIED = "verified"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class Donation(db.Model):
    __tablename__ = "donations"

    id = db.Column(db.Integer, primary_key=True)

    blood_request_id = db.Column(
        db.Integer,
        db.ForeignKey("blood_requests.id"),
        nullable=False
    )

    donor_id = db.Column(
        db.Integer,
        db.ForeignKey("donors.id"),
        nullable=False
    )

    status = db.Column(
        db.Enum(DonationStatus),
        nullable=False,
        default=DonationStatus.PENDING
    )

    donated_units = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )

    accepted_at = db.Column(
        db.DateTime
    )

    donated_at = db.Column(
        db.DateTime
    )

    verified_at = db.Column(
        db.DateTime
    )

    remarks = db.Column(
        db.Text
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    blood_request = db.relationship(
        "BloodRequest",
        back_populates="donations"
    )

    donor = db.relationship(
        "Donor",
        back_populates="donations"
    )
    
    rejection_reason = db.Column(db.Text)
    