from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.user_admin_action import UserAdminAction


def _blocked_message(reason=None):
    message = "Your account has been blocked by the administrator."
    if reason:
        message += f" Reason: {reason}."
    message += (
        " You can send a message via the Contact page "
        "to request an unlock."
    )
    return message


def role_required(*roles):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            user = db.session.get(User, user_id)
            if not user:
                return jsonify({
                    "message": "User not found."
                }), 404
            user_roles = user.role.split(",") if user.role else []
            if not any(r in user_roles for r in roles):
                return jsonify({
                    "message": "Access denied."
                }), 403
            if not user.is_active:
                action = (
                    UserAdminAction.query
                    .filter_by(user_id=user.id, action="block")
                    .order_by(UserAdminAction.created_at.desc())
                    .first()
                )
                reason = action.reason if action else None
                return jsonify({
                    "message": _blocked_message(reason)
                }), 403
            if "blood_bank" in user_roles:
                from app.models.blood_bank import BloodBank
                blood_bank = BloodBank.query.filter_by(user_id=user.id).first()
                if blood_bank and blood_bank.status == "rejected":
                    message = (
                        "Your blood bank account has been blocked "
                        "by the administrator."
                    )
                    if blood_bank.rejection_reason:
                        message += (
                            f" Reason: {blood_bank.rejection_reason}."
                        )
                    message += (
                        " You can send a message via the Contact page "
                        "to request an unlock."
                    )
                    return jsonify({"message": message}), 403
            return func(*args, **kwargs)
        return wrapper
    return decorator