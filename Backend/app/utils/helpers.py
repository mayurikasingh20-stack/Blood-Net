from app.extensions import db
from app.models.notification import Notification


def get_missing_fields(data, required_fields):
    missing = []

    for field in required_fields:
        if field not in data or not data[field]:
            missing.append(field)

    return missing


def create_notification(
    user_id,
    title,
    message,
    notification_type,
    reference_id=None
):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        reference_id=reference_id
    )

    db.session.add(notification)

    return notification