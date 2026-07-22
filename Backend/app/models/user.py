from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    first_name = db.Column(db.String(50), nullable=False)

    last_name = db.Column(db.String(50), nullable=False)

    email = db.Column(db.String(150), unique=True, nullable=True)

    phone = db.Column(db.String(20), unique=True, nullable=False)

    password_hash = db.Column(db.String(255), nullable=False)

    role = db.Column(
        db.Enum(
            "donor",
            "patient",
            "blood_bank",
            "admin",
            name="user_roles"
        ),
        nullable=False
    )

    gender = db.Column(
        db.Enum(
            "Male",
            "Female",
            "Other",
            name="gender_enum"
        ),
        nullable=False
    )

    dob = db.Column(db.Date, nullable=False)

    city = db.Column(db.String(100), nullable=False)

    address = db.Column(db.String(255))

    is_active = db.Column(db.Boolean, default=True)

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now()
    )

    donor = db.relationship(
        "Donor",
        back_populates="user",
        uselist=False,
        cascade="all, delete"
    )

    patient = db.relationship(
        "Patient",
        back_populates="user",
        uselist=False,
        cascade="all, delete"
    )

    blood_bank = db.relationship(
        "BloodBank",
        back_populates="user",
        uselist=False,
        cascade="all, delete"
    )
    
    blood_requests = db.relationship(
    "BloodRequest",
    back_populates="requester",
    lazy=True
)
    
    notifications = db.relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete"
    )

    def __repr__(self):
        return f"<User {self.email}>"