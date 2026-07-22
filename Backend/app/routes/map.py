from datetime import date
from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.public_blood_bank import PublicBloodBank
from app.models.camp import Camp

map_bp = Blueprint("map", __name__, url_prefix="/api/map")


@map_bp.get("/blood-banks")
def map_blood_banks():
    state_code = request.args.get("state_code", type=int)
    dist_id = request.args.get("dist_id", type=int)
    city = request.args.get("city", type=str)

    query = PublicBloodBank.query.filter(
        PublicBloodBank.latitude.isnot(None),
        PublicBloodBank.longitude.isnot(None),
        PublicBloodBank.latitude != 0,
        PublicBloodBank.longitude != 0,
    )

    if state_code:
        query = query.filter_by(state_code=state_code)
    if dist_id:
        query = query.filter_by(dist_id=dist_id)
    if city:
        query = query.filter(PublicBloodBank.address.ilike(f"%{city}%"))

    banks = query.order_by(PublicBloodBank.name).all()

    return jsonify([
        {
            "id": b.id,
            "lat": b.latitude,
            "lng": b.longitude,
            "name": b.name,
            "city": (b.address or "").split(",")[0].strip() if b.address else "",
            "address": b.address,
            "phone": b.phone,
            "email": b.email,
            "hospital_type": b.hospital_type,
            "state_code": b.state_code,
            "dist_id": b.dist_id,
        }
        for b in banks
    ])


@map_bp.get("/camps")
def map_camps():
    today = date.today()
    camps = Camp.query.filter(Camp.date >= today).order_by(Camp.date).all()
    return jsonify([
        {
            "id": c.id,
            "lat": c.latitude,
            "lng": c.longitude,
            "title": c.title,
            "date": c.date.isoformat() if c.date else None,
            "time": c.time,
            "venue": c.venue,
            "address": c.address,
            "status": c.status,
            "blood_bank_id": c.blood_bank_id,
        }
        for c in camps
        if c.latitude and c.longitude
    ])
