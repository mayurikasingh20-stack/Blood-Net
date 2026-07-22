from app.extensions import db


class Patient(db.Model):
    __tablename__ = "patients"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    # One-to-One relationship with User
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    # Blood Requirement Details
    blood_group_needed = db.Column(
        db.String(5),
        nullable=False
    )

    hospital_name = db.Column(
        db.String(150),
        nullable=False
    )

    condition_description = db.Column(
        db.Text,
        nullable=False
    )

    urgency_level = db.Column(
        db.Enum(
            "Critical",
            "High",
            "Moderate",
            name="urgency_level"
        ),
        nullable=False,
        default="Moderate"
    )

    relation_to_patient = db.Column(
        db.Enum(
            "Self",
            "Family",
            "Friend",
            name="relation_type"
        ),
        nullable=False
    )

    # Verification Document
    doctor_note_path = db.Column(
        db.String(255),
        nullable=True
    )

    # Verification Status
    verification_status = db.Column(
        db.Enum(
            "Pending",
            "Verified",
            "Rejected",
            name="verification_status"
        ),
        nullable=False,
        default="Pending"
    )

    verified_at = db.Column(
        db.DateTime,
        nullable=True
    )

    rejection_reason = db.Column(
        db.Text,
        nullable=True
    )

    # Request Status
    status = db.Column(
        db.Enum(
            "Pending",
            "Approved",
            "Completed",
            "Cancelled",
            name="patient_status"
        ),
        nullable=False,
        default="Pending"
    )

    additional_notes = db.Column(
        db.Text,
        nullable=True
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

    # Relationship with User
    user = db.relationship(
        "User",
        back_populates="patient",
        lazy=True
    )

    blood_requests = db.relationship(
        "BloodRequest",
        back_populates="patient",
        lazy=True
    )

    def __repr__(self):
        return f"<Patient {self.user.email}>"