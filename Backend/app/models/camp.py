from app.extensions import db
from datetime import datetime


class Camp(db.Model):
    __tablename__ = "camps"

    id = db.Column(db.Integer, primary_key=True)
    blood_bank_id = db.Column(
        db.Integer,
        db.ForeignKey("blood_banks.id"),
        nullable=False
    )
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(50), nullable=True)
    venue = db.Column(db.String(200), nullable=False)
    address = db.Column(db.Text, nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    status = db.Column(
        db.String(20),
        default="upcoming"
    )
    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    blood_bank = db.relationship(
        "BloodBank",
        back_populates="camps"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "blood_bank_id": self.blood_bank_id,
            "title": self.title,
            "description": self.description,
            "date": self.date.isoformat() if self.date else None,
            "time": self.time,
            "venue": self.venue,
            "address": self.address,
            "lat": self.latitude,
            "lng": self.longitude,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
