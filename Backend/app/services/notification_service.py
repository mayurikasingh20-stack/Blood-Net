from flask_jwt_extended import get_jwt_identity

from app.extensions import db
from app.models.notification import Notification, NotificationStatus
from app.models.user import User

def get_notifications():

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if user is None:
        return {
            "message": "User not found."
        }, 404

    notifications = (
        Notification.query
        .filter_by(user_id=user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    result = []

    for notification in notifications:
        result.append({
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "status": notification.status.value,
            "reference_id": notification.reference_id,
            "created_at": notification.created_at
        })

    return {
        "notifications": result
    }, 200
    
def mark_notification_as_read(notification_id):

    user_id = get_jwt_identity()

    notification = db.session.get(
        Notification,
        notification_id
    )

    if notification is None:
        return {
            "message": "Notification not found."
        }, 404

    if notification.user_id != user_id:
        return {
            "message": "Unauthorized."
        }, 403

    notification.status = NotificationStatus.READ

    db.session.commit()

    return {
        "message": "Notification marked as read."
    }, 200
    
def mark_all_notifications_as_read():

    user_id = get_jwt_identity()

    Notification.query.filter_by(
        user_id=user_id,
        status=NotificationStatus.UNREAD
    ).update({
        "status": NotificationStatus.READ
    })

    db.session.commit()

    return {
        "message": "All notifications marked as read."
    }, 200