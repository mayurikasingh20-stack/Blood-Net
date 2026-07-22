from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.utils.decorator import role_required
from app.services.camp_service import (
    create_camp,
    get_all_camps,
    get_upcoming_camps,
    get_current_camps,
    get_my_camps,
    update_camp,
    delete_camp,
)

camps_bp = Blueprint("camps", __name__, url_prefix="/api/camps")


@camps_bp.post("/")
@jwt_required()
@role_required("blood_bank")
def create():
    data = request.get_json()
    result, status = create_camp(data)
    return jsonify(result), status


@camps_bp.get("/")
def list_all():
    result, status = get_all_camps()
    return jsonify(result), status


@camps_bp.get("/upcoming")
def upcoming():
    result, status = get_upcoming_camps()
    return jsonify(result), status


@camps_bp.get("/current")
def current():
    result, status = get_current_camps()
    return jsonify(result), status


@camps_bp.get("/my-camps")
@jwt_required()
@role_required("blood_bank")
def my_camps():
    result, status = get_my_camps()
    return jsonify(result), status


@camps_bp.put("/<int:camp_id>")
@jwt_required()
@role_required("blood_bank")
def update(camp_id):
    data = request.get_json()
    result, status = update_camp(camp_id, data)
    return jsonify(result), status


@camps_bp.delete("/<int:camp_id>")
@jwt_required()
@role_required("blood_bank")
def delete(camp_id):
    result, status = delete_camp(camp_id)
    return jsonify(result), status
