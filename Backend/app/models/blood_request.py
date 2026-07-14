from app.extensions import db
class BloodRequest(db.Model):
    __tablename__ = "blood_requests"
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer,db.ForeignKey("patients.id"),nullable=False)
    blood_group = db.Column(db.String(5), nullable=False)
    units = db.Column(db.Integer, nullable=False)
    hospital = db.Column(db.String(150),nullable=False)
    city = db.Column(db.String(100),nullable=False)
    status = db.Column(db.Enum("pending","Accepted","Completed","Cancelled",name="request_status"),default="pending")
    created_at = db.Column(db.DateTime,server_default=db.func.now())
    patient = db.relationship("Patient",backref="blood_requests")
    
    def __repr__(self):
        return f"<BloodRequest {self.id}>"