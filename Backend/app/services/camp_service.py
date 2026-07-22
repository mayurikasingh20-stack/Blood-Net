from datetime import date, datetime
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.camp import Camp
from app.models.blood_bank import BloodBank
from app.models.user import User


def create_camp(data):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return {"error": "User not found."}, 404

    blood_bank = BloodBank.query.filter_by(user_id=user.id).first()
    if not blood_bank:
        return {"error": "Blood bank profile not found."}, 404

    camp = Camp(
        blood_bank_id=blood_bank.id,
        title=data.get("title"),
        description=data.get("description"),
        date=datetime.strptime(data["date"], "%Y-%m-%d").date(),
        time=data.get("time"),
        venue=data.get("venue"),
        address=data.get("address"),
        latitude=data.get("lat") or data.get("latitude"),
        longitude=data.get("lng") or data.get("longitude"),
    )

    db.session.add(camp)
    db.session.commit()
    return {"message": "Camp created successfully.", "camp": camp.to_dict()}, 201


def get_all_camps():
    camps = Camp.query.order_by(Camp.date.desc()).all()
    return {"camps": [c.to_dict() for c in camps]}, 200


def get_upcoming_camps():
    today = date.today()
    camps = Camp.query.filter(Camp.date >= today).order_by(Camp.date).all()
    return {"camps": [c.to_dict() for c in camps]}, 200


def get_current_camps():
    today = date.today()
    camps = Camp.query.filter(Camp.date == today).order_by(Camp.time).all()
    return {"camps": [c.to_dict() for c in camps]}, 200


def get_my_camps():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return {"error": "User not found."}, 404

    blood_bank = BloodBank.query.filter_by(user_id=user.id).first()
    if not blood_bank:
        return {"error": "Blood bank profile not found."}, 404

    camps = Camp.query.filter_by(blood_bank_id=blood_bank.id).order_by(Camp.date.desc()).all()
    return {"camps": [c.to_dict() for c in camps]}, 200


def update_camp(camp_id, data):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return {"error": "User not found."}, 404

    blood_bank = BloodBank.query.filter_by(user_id=user.id).first()
    if not blood_bank:
        return {"error": "Blood bank profile not found."}, 404

    camp = Camp.query.filter_by(id=camp_id, blood_bank_id=blood_bank.id).first()
    if not camp:
        return {"error": "Camp not found."}, 404

    if "title" in data:
        camp.title = data["title"]
    if "description" in data:
        camp.description = data["description"]
    if "date" in data:
        camp.date = datetime.strptime(data["date"], "%Y-%m-%d").date()
    if "time" in data:
        camp.time = data["time"]
    if "venue" in data:
        camp.venue = data["venue"]
    if "address" in data:
        camp.address = data["address"]
    if "lat" in data or "latitude" in data:
        camp.latitude = data.get("lat") or data.get("latitude")
    if "lng" in data or "longitude" in data:
        camp.longitude = data.get("lng") or data.get("longitude")
    if "status" in data:
        camp.status = data["status"]

    db.session.commit()
    return {"message": "Camp updated successfully.", "camp": camp.to_dict()}, 200


def delete_camp(camp_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return {"error": "User not found."}, 404

    blood_bank = BloodBank.query.filter_by(user_id=user.id).first()
    if not blood_bank:
        return {"error": "Blood bank profile not found."}, 404

    camp = Camp.query.filter_by(id=camp_id, blood_bank_id=blood_bank.id).first()
    if not camp:
        return {"error": "Camp not found."}, 404

    db.session.delete(camp)
    db.session.commit()
    return {"message": "Camp deleted successfully."}, 200
