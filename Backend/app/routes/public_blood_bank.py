from flask import Blueprint, jsonify, request
from sqlalchemy import func
from app.extensions import db
from app.models.public_blood_bank import PublicBloodBank
from app.models.blood_bank import BloodBank
from app.models.user import User

public_bb_bp = Blueprint(
    "public_blood_bank",
    __name__,
    url_prefix="/api/public-blood-banks"
)


def _registered_to_dict(bank):
    user = bank.user
    return {
        "id": f"reg-{bank.id}",
        "name": bank.facility_name,
        "address": bank.address,
        "phone": user.phone if user else None,
        "email": user.email if user else None,
        "facility": None,
        "hospital_type": "Blood Bank",
        "city": user.city if user else None,
        "hospital_code": None,
        "latitude": bank.latitude,
        "longitude": bank.longitude,
        "camp_source": None,
        "stock_source": None,
        "dist_id": None,
        "state_code": None,
        "type": None,
        "dist": None,
        "source": "registered",
    }


@public_bb_bp.get("/")
def list_public_blood_banks():
    query = PublicBloodBank.query
    query = _apply_filters(query)
    banks = query.order_by(PublicBloodBank.name).all()
    return jsonify({"blood_banks": [b.to_dict() for b in banks]}), 200


@public_bb_bp.get("/random")
def random_public_blood_banks():
    limit = request.args.get("limit", 10, type=int)
    limit = min(max(limit, 1), 50)

    half = limit // 2
    public_banks = PublicBloodBank.query.order_by(func.random()).limit(half).all()
    registered_banks = BloodBank.query.filter(
        BloodBank.status == "approved"
    ).order_by(func.random()).limit(limit - half).all()

    combined = [b.to_dict() for b in public_banks]
    combined.extend(_registered_to_dict(b) for b in registered_banks)

    import random
    random.shuffle(combined)

    return jsonify({"blood_banks": combined}), 200


@public_bb_bp.get("/search")
def search_public_blood_banks():
    q = request.args.get("q", "").strip()

    public_query = PublicBloodBank.query

    if q:
        public_query = public_query.filter(
            PublicBloodBank.name.ilike(f"%{q}%") |
            PublicBloodBank.city.ilike(f"%{q}%")
        )

    public_banks = public_query.order_by(PublicBloodBank.name).all()

    registered_query = BloodBank.query.filter(BloodBank.status == "approved")
    if q:
        registered_query = registered_query.join(User, BloodBank.user_id == User.id).filter(
            BloodBank.facility_name.ilike(f"%{q}%") |
            User.city.ilike(f"%{q}%")
        )

    registered_banks = registered_query.all()

    combined = [b.to_dict() for b in public_banks]
    combined.extend(_registered_to_dict(b) for b in registered_banks)

    return jsonify({
        "blood_banks": combined,
        "count": len(combined)
    }), 200


@public_bb_bp.get("/<int:bank_id>")
def get_public_blood_bank(bank_id):
    bank = db.session.get(PublicBloodBank, bank_id)
    if not bank:
        return jsonify({"error": "Blood bank not found"}), 404
    return jsonify({"blood_bank": bank.to_dict()}), 200


def _apply_filters(query):
    state_code = request.args.get("state_code", type=int)
    dist_id = request.args.get("dist_id", type=int)
    search = request.args.get("search")
    if state_code:
        query = query.filter_by(state_code=state_code)
    if dist_id:
        query = query.filter_by(dist_id=dist_id)
    if search:
        query = query.filter(
            PublicBloodBank.name.ilike(f"%{search}%") |
            PublicBloodBank.address.ilike(f"%{search}%")
        )
    return query
