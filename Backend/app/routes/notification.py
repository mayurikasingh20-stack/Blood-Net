from flask import Blueprint
from flask_jwt_extended import jwt_required

from app.services.notification_service import (
    get_notifications,
    mark_notification_as_read,
    mark_all_notifications_as_read
)

notification_bp = Blueprint(
    "notification",
    __name__,
    url_prefix="/api/notifications"
)

@notification_bp.get("/")
@jwt_required()
def get_all_notifications():
    return get_notifications()

@notification_bp.patch("/<int:notification_id>/read")
@jwt_required()
def read_notification(notification_id):
    return mark_notification_as_read(notification_id)

@notification_bp.patch("/read-all")
@jwt_required()
def read_all_notifications():
    return mark_all_notifications_as_read()