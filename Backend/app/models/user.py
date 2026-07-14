from app.extensions import db

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    Last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True , nullable=False)
    password = db.Column(db.String(200), nullable=False)
    gender = db.Column(db.Enum("male","female","other",name="gender"),nullable=False)
    role = db.Column(db.Enum("admin","donor","patient",name="user_roles"),nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    donor = db.relationship("Donor",backref="user",uselist=False,cascade="all, delete")
    patient = db.relationship("Patient",backref="user",uselist=False,cascade="all, delete")
    notifications = db.relationship("Notification",backref="user",cascade="all, delete")
    
    def __repr__(self):
        return f"<User {self.first_name} {self.Last_name} {self.email}>"