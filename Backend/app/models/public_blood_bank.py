from app.extensions import db


class PublicBloodBank(db.Model):
    __tablename__ = "public_blood_banks"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(255), nullable=False)

    address = db.Column(db.Text, nullable=False)

    phone = db.Column(db.String(100), nullable=True)

    email = db.Column(db.String(255), nullable=True)

    facility = db.Column(db.String(255), nullable=True)

    hospital_type = db.Column(db.String(50), nullable=True)

    city = db.Column(db.String(255), nullable=True)

    hospital_code = db.Column(db.Integer, nullable=True, unique=True)

    latitude = db.Column(db.Float, nullable=True)

    longitude = db.Column(db.Float, nullable=True)

    camp_source = db.Column(db.Integer, nullable=True)

    stock_source = db.Column(db.Integer, nullable=True)

    dist_id = db.Column(db.Integer, nullable=True)

    state_code = db.Column(db.Integer, nullable=True)

    type = db.Column(db.String(50), nullable=True)

    dist = db.Column(db.Float, nullable=True)

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now()
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "phone": self.phone,
            "email": self.email,
            "facility": self.facility,
            "hospital_type": self.hospital_type,
            "city": self.city,
            "hospital_code": self.hospital_code,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "camp_source": self.camp_source,
            "stock_source": self.stock_source,
            "dist_id": self.dist_id,
            "state_code": self.state_code,
            "type": self.type,
            "dist": self.dist,
        }

    def __repr__(self):
        return f"<PublicBloodBank {self.name}>"
