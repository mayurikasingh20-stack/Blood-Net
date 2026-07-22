from app.extensions import db
from datetime import datetime


class Donor(db.Model):
    __tablename__ = "donors"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True
    )
    user = db.relationship(
        "User",
        back_populates="donor",
        lazy=True
    )
    blood_group = db.Column(db.String(5), nullable=False)
    weight = db.Column(db.Float, nullable=False)
    last_donation_date = db.Column(db.Date)
    has_chronic_condition = db.Column(
        db.Boolean,
        default=False
    )
    on_medication = db.Column(
        db.Boolean,
        default=False
    )
    is_eligible = db.Column(
        db.Boolean,
        default=True,
        nullable=False
    )
    available = db.Column(
        db.Boolean,
        default=True
    )

    # Screening audit fields
    screening_completed = db.Column(
        db.Boolean,
        default=False
    )
    screening_date = db.Column(
        db.DateTime,
        nullable=True
    )
    screening_result = db.Column(
        db.String(20),
        nullable=True
    )
    failed_reason = db.Column(
        db.Text,
        nullable=True
    )

    # Medical history (optional, for reference)
    diabetes = db.Column(db.Boolean, default=False)
    hypertension = db.Column(db.Boolean, default=False)
    asthma = db.Column(db.Boolean, default=False)
    major_surgeries = db.Column(db.Text, nullable=True)
    current_medications = db.Column(db.Text, nullable=True)
    allergies = db.Column(db.Text, nullable=True)
    smoking_status = db.Column(db.String(20), nullable=True)
    alcohol_consumption = db.Column(db.String(20), nullable=True)
    tattoo_piercing_date = db.Column(db.Date, nullable=True)
    chronic_illness = db.Column(db.Text, nullable=True)

    # Family history
    family_thalassemia = db.Column(db.Boolean, default=False)
    family_sickle_cell = db.Column(db.Boolean, default=False)
    family_hereditary_disorders = db.Column(db.Text, nullable=True)

    donations = db.relationship(
        "Donation",
        back_populates="donor",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Donor {self.user.email}>"

    def check_donation_interval(self):
        if not self.last_donation_date:
            return True, None
        delta = datetime.utcnow().date() - self.last_donation_date
        if delta.days < 56:
            next_date = self.last_donation_date.isoformat()
            return False, next_date
        return True, None