import enum

from app.extensions import db


class RequestStatus(enum.Enum):
    PENDING = "pending"
    MATCHED = "matched"
    ACCEPTED = "accepted"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class UrgencyLevel(enum.Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    CRITICAL = "Critical"


class BloodRequest(db.Model):
    __tablename__ = "blood_requests"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    # User who created the request
    created_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    # Request can belong to either a Patient or a Blood Bank
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id"),
        nullable=True
    )

    blood_bank_id = db.Column(
        db.Integer,
        db.ForeignKey("blood_banks.id"),
        nullable=True
    )

    blood_group = db.Column(
        db.String(5),
        nullable=False
    )

    units = db.Column(
        db.Integer,
        nullable=False
    )

    hospital = db.Column(
        db.String(150),
        nullable=False
    )

    hospital_address = db.Column(
        db.Text,
        nullable=False
    )

    city = db.Column(
        db.String(100),
        nullable=False
    )

    urgency_level = db.Column(
        db.Enum(UrgencyLevel),
        default=UrgencyLevel.MODERATE,
        nullable=False
    )

    required_before = db.Column(
        db.DateTime,
        nullable=False
    )

    purpose = db.Column(
        db.Text,
        nullable=True
    )

    contact_name = db.Column(
        db.String(100),
        nullable=False
    )

    contact_phone = db.Column(
        db.String(20),
        nullable=False
    )

    fulfilled_units = db.Column(
        db.Integer,
        default=0,
        nullable=False
    )

    status = db.Column(
        db.Enum(RequestStatus),
        default=RequestStatus.PENDING,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now()
    )

    # ---------------- Relationships ---------------- #

    requester = db.relationship(
        "User",
        back_populates="blood_requests"
    )

    patient = db.relationship(
        "Patient",
        back_populates="blood_requests"
    )

    blood_bank = db.relationship(
        "BloodBank",
        back_populates="blood_requests"
    )

    donations = db.relationship(
        "Donation",
        back_populates="blood_request",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return (
            f"<BloodRequest {self.id} - "
            f"{self.blood_group} - "
            f"{self.status.value}>"
        )