from app.extensions import db

class Donor(db.Model):
    __tablename__ = "donors"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)
    blood_group = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer , nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    city = db.Column(db.String(100),nullable=False)
    state = db.Column(db.String(100),nullable=False)
    address = db.Column(db.String(250),nullable=False)
    pincode = db.Column(db.String(10), nullable=False)
    last_donation = db.Column(db.Date)
    available = db.Column(db.Boolean, default=True)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    def __repr__(self):
        return f"<Donor {self.id}>"