from app.extensions import db


class BloodBank(db.Model):
    __tablename__ = "blood_banks"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    facility_name = db.Column(
        db.String(150),
        nullable=False
    )

    status = db.Column(
        db.Enum(
            "pending",
            "approved",
            "rejected",
            name="bank_status"
        ),
        default="pending"
    )
    
    verified_at = db.Column(
    db.DateTime,
    nullable=True
)
    rejection_reason = db.Column(
    db.Text,
    nullable=True
)
    contact_person = db.Column(
    db.String(100),
    nullable=False
)
    address = db.Column(
    db.Text,
    nullable=False
)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    operating_hours = db.Column(
    db.String(100),
    nullable=True
)

    website = db.Column(
    db.String(255),
    nullable=True
)

    available_24x7 = db.Column(
    db.Boolean,
    default=False
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
    back_populates="blood_bank"
)
    inventory = db.relationship(
    "Inventory",
    back_populates="blood_bank",
    cascade="all, delete-orphan",
)

    blood_requests = db.relationship(
        "BloodRequest",
        back_populates="blood_bank",
        lazy=True
    )

    camps = db.relationship(
        "Camp",
        back_populates="blood_bank",
        cascade="all, delete-orphan",
        lazy=True
    )

    inventory_history = db.relationship(
        "InventoryHistory",
        back_populates="blood_bank",
        cascade="all, delete-orphan",
        lazy=True
    )

    def __repr__(self):
        return f"<BloodBank {self.facility_name}>"