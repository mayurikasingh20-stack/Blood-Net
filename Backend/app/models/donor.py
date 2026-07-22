from app.extensions import db


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
    donations = db.relationship(
    "Donation",
    back_populates="donor",
    cascade="all, delete-orphan"
)
    
    def __repr__(self):
        return f"<Donor {self.user.email}>"