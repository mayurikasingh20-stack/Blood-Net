from app.extensions import db

class Patient(db.Model):
    __tablename__ = "patients"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"),nullable=False,unique=True)
    hospital_name = db.Column(db.String(150), nullable=False)
    blood_group_needed = db.Column(db.String(5),nullable=False)
    units_required = db.Column(db.Integer,nullable=False)
    phone= db.Column(db.String(15),nullable=False)
    city= db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100),nullable=False)
    address= db.Column(db.String(250),nullable=False)
    pincode= db.Column(db.String(5),nullable=False)
    
    def __repr__(self):
        return f"<Patient {self.id}>"
    