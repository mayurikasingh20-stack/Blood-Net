from app.extensions import db


class Patient(db.Model):
    __tablename__ = "patients"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

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
            "Low",
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

    doctor_note_path = db.Column(
        db.String(255),
        nullable=True
    )

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
        email = self.user.email if self.user else "no-user"
        return f"<Patient {email}>"