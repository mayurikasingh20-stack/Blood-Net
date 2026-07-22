from datetime import datetime
import enum

from app.extensions import db


class NotificationStatus(enum.Enum):
    UNREAD = "unread"
    READ = "read"


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    title = db.Column(
        db.String(200),
        nullable=False
    )

    message = db.Column(
        db.Text,
        nullable=False
    )

    notification_type = db.Column(
        db.String(50),
        nullable=False
    )

    status = db.Column(
        db.Enum(NotificationStatus),
        default=NotificationStatus.UNREAD,
        nullable=False
    )

    reference_id = db.Column(
        db.Integer
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    user = db.relationship(
        "User",
        back_populates="notifications"
    )