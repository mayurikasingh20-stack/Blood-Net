from datetime import datetime
from app.extensions import db


class UserAdminAction(db.Model):
    __tablename__ = "user_admin_actions"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    admin_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    action = db.Column(
        db.Enum("block", "unblock", name="user_admin_action"),
        nullable=False
    )

    reason = db.Column(db.Text, nullable=False)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    user = db.relationship("User", back_populates="admin_actions", foreign_keys=[user_id])
    admin = db.relationship("User", foreign_keys=[admin_id])

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "admin_id": self.admin_id,
            "action": self.action,
            "reason": self.reason,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
