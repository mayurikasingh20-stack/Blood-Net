from app.extensions import db

class BloodBank(db.Model):
    __tablename__ = "blood_banks"
    id = db.Column(db.Integer, primary_key=True)
    name=db.Column(db.String(150),nullable=False)
    email=db.Column(db.String(255),nullable=False)
    phone=db.Column(db.String(15),nullable=False)
    license_number=db.Column(db.String(150),nullable=False)
    city=db.Column(db.String(100),nullable=False)
    state=db.Column(db.String(100),nullable=False)
    address=db.Column(db.String(250),nullable=False)
    pincode = db.Column(db.String(10))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)

    def __repr__(self):
        return f"<BloodBank {self.name}>"