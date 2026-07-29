from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.contact_message import ContactMessage
from app.utils.decorator import role_required

contact_bp = Blueprint("contact", __name__, url_prefix="/api/contact")

@contact_bp.post("/send")
def send_message():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()
    subject = data.get("subject", "").strip()
    message = data.get("message", "").strip()

    if not all([name, email, phone, subject, message]):
        return jsonify({"message": "All fields are required."}), 400
    if len(message) < 10:
        return jsonify({"message": "Message must be at least 10 characters."}), 400

    contact = ContactMessage(name=name, email=email, phone=phone, subject=subject, message=message)
    db.session.add(contact)
    db.session.commit()

    return jsonify({"message": "Message sent successfully!"}), 201


@contact_bp.get("/messages")
@jwt_required()
@role_required("admin")
def get_messages():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    unread_first = request.args.get("unread_first", "true").lower() == "true"

    query = ContactMessage.query

    if unread_first:
        messages = query.order_by(ContactMessage.is_read.asc(), ContactMessage.created_at.desc()).all()
    else:
        messages = query.order_by(ContactMessage.created_at.desc()).all()

    total = len(messages)
    start = (page - 1) * per_page
    end = start + per_page
    page_messages = messages[start:end]

    return jsonify({
        "messages": [m.to_dict() for m in page_messages],
        "total": total,
        "page": page,
        "per_page": per_page,
        "unread_count": sum(1 for m in messages if not m.is_read),
    }), 200


@contact_bp.patch("/messages/<int:message_id>/read")
@jwt_required()
@role_required("admin")
def mark_read(message_id):
    message = db.session.get(ContactMessage, message_id)
    if not message:
        return jsonify({"message": "Message not found."}), 404
    message.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read."}), 200


@contact_bp.delete("/messages/<int:message_id>")
@jwt_required()
@role_required("admin")
def delete_message(message_id):
    message = db.session.get(ContactMessage, message_id)
    if not message:
        return jsonify({"message": "Message not found."}), 404
    db.session.delete(message)
    db.session.commit()
    return jsonify({"message": "Message deleted."}), 200
