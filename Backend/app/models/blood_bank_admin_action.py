from datetime import datetime
from app.extensions import db


class BloodBankAdminAction(db.Model):
    __tablename__ = "blood_bank_admin_actions"

    id = db.Column(db.Integer, primary_key=True)

    blood_bank_id = db.Column(
        db.Integer,
        db.ForeignKey("blood_banks.id"),
        nullable=False
    )

    admin_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    action = db.Column(
        db.Enum("block", "unblock", name="blood_bank_admin_action"),
        nullable=False
    )

    reason = db.Column(db.Text, nullable=False)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    blood_bank = db.relationship("BloodBank", back_populates="admin_actions")
    admin = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "blood_bank_id": self.blood_bank_id,
            "admin_id": self.admin_id,
            "action": self.action,
            "reason": self.reason,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }