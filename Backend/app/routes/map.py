from datetime import date
from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.public_blood_bank import PublicBloodBank
from app.models.blood_bank import BloodBank
from app.models.camp import Camp
from sqlalchemy import or_

map_bp = Blueprint("map", __name__, url_prefix="/api/map")


@map_bp.get("/blood-banks")
def map_blood_banks():
    state_code = request.args.get("state_code", type=int)
    dist_id = request.args.get("dist_id", type=int)
    city = request.args.get("city", type=str)
    q = request.args.get("q", type=str)

    public_query = PublicBloodBank.query.filter(
        PublicBloodBank.latitude.isnot(None),
        PublicBloodBank.longitude.isnot(None),
        PublicBloodBank.latitude != 0,
        PublicBloodBank.longitude != 0,
    )

    if state_code:
        public_query = public_query.filter_by(state_code=state_code)
    if dist_id:
        public_query = public_query.filter_by(dist_id=dist_id)
    if city:
        public_query = public_query.filter(PublicBloodBank.address.ilike(f"%{city}%"))
    if q:
        public_query = public_query.filter(
            or_(
                PublicBloodBank.name.ilike(f"%{q}%"),
                PublicBloodBank.address.ilike(f"%{q}%"),
            )
        )

    public_banks = public_query.order_by(PublicBloodBank.name).all()

    registered_query = BloodBank.query.filter(
        BloodBank.status == "approved",
        BloodBank.latitude.isnot(None),
        BloodBank.longitude.isnot(None),
    )

    if city:
        registered_query = registered_query.filter(BloodBank.address.ilike(f"%{city}%"))
    if q:
        registered_query = registered_query.filter(
            or_(
                BloodBank.facility_name.ilike(f"%{q}%"),
                BloodBank.address.ilike(f"%{q}%"),
            )
        )

    registered_banks = registered_query.all()

    results = [
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
            "source": "public",
        }
        for b in public_banks
    ]

    for b in registered_banks:
        user = b.user
        results.append({
            "id": f"reg-{b.id}",
            "lat": b.latitude,
            "lng": b.longitude,
            "name": b.facility_name,
            "city": (b.address or "").split(",")[0].strip() if b.address else "",
            "address": b.address,
            "phone": user.phone if user else None,
            "email": user.email if user else None,
            "hospital_type": "Blood Bank",
            "state_code": None,
            "dist_id": None,
            "source": "registered",
        })

    return jsonify(results)


@map_bp.get("/registered-blood-banks")
def registered_blood_banks():
    city = request.args.get("city", type=str)
    q = request.args.get("q", type=str)

    query = BloodBank.query.filter(
        BloodBank.status == "approved",
        BloodBank.latitude.isnot(None),
        BloodBank.longitude.isnot(None),
    )

    if city:
        query = query.filter(BloodBank.address.ilike(f"%{city}%"))
    if q:
        query = query.filter(
            or_(
                BloodBank.facility_name.ilike(f"%{q}%"),
                BloodBank.address.ilike(f"%{q}%"),
            )
        )

    banks = query.all()

    return jsonify([
        {
            "id": f"reg-{b.id}",
            "lat": b.latitude,
            "lng": b.longitude,
            "name": b.facility_name,
            "address": b.address,
            "contact_person": b.contact_person,
            "operating_hours": b.operating_hours,
            "available_24x7": b.available_24x7,
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
