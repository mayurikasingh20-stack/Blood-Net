from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.public_blood_bank import PublicBloodBank

public_bb_bp = Blueprint(
    "public_blood_bank",
    __name__,
    url_prefix="/api/public-blood-banks"
)


@public_bb_bp.get("/")
def list_public_blood_banks():
    state_code = request.args.get("state_code", type=int)
    dist_id = request.args.get("dist_id", type=int)
    search = request.args.get("search")

    query = PublicBloodBank.query

    if state_code:
        query = query.filter_by(state_code=state_code)
    if dist_id:
        query = query.filter_by(dist_id=dist_id)
    if search:
        query = query.filter(
            PublicBloodBank.name.ilike(f"%{search}%") |
            PublicBloodBank.address.ilike(f"%{search}%")
        )

    banks = query.order_by(PublicBloodBank.name).all()

    return jsonify({
        "blood_banks": [b.to_dict() for b in banks]
    }), 200


@public_bb_bp.get("/<int:bank_id>")
def get_public_blood_bank(bank_id):
    bank = db.session.get(PublicBloodBank, bank_id)
    if not bank:
        return jsonify({"error": "Blood bank not found"}), 404
    return jsonify({"blood_bank": bank.to_dict()}), 200
