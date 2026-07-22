from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.services.inventory_service import (
    add_inventory,
    adjust_inventory,
    get_inventory,
    get_inventory_by_id,
    update_inventory,
    delete_inventory,
    search_inventory,
    filter_inventory,
    get_inventory_by_blood_bank
)

inventory_bp = Blueprint(
    "inventory",
    __name__,
    url_prefix="/api/inventory"
)


@inventory_bp.post("/")
@jwt_required()
def create_inventory():
    data = request.get_json()

    response, status = add_inventory(data)

    return jsonify(response), status


@inventory_bp.post("/adjust")
@jwt_required()
def adjust_stock():
    data = request.get_json()

    response, status = adjust_inventory(data)

    return jsonify(response), status


@inventory_bp.get("/")
@jwt_required()
def list_inventory():

    response, status = get_inventory()

    return jsonify(response), status


@inventory_bp.get("/<int:inventory_id>")
@jwt_required()
def inventory_details(inventory_id):
    response, status = get_inventory_by_id(inventory_id)
    return jsonify(response), status

@inventory_bp.put("/<int:inventory_id>")
@jwt_required()
def edit_inventory(inventory_id):
    data = request.get_json()
    response, status = update_inventory(
        inventory_id,
        data,
    )
    return jsonify(response), status


@inventory_bp.delete("/<int:inventory_id>")
@jwt_required()
def remove_inventory(inventory_id):
    response, status = delete_inventory(
        inventory_id,
    )
    return jsonify(response), status

@inventory_bp.get("/search")
@jwt_required()
def search():
    blood_group = request.args.get("blood_group", "")
    response, status = search_inventory(blood_group)
    return jsonify(response), status

@inventory_bp.get("/filter")
@jwt_required()
def filter_items():

    status = request.args.get("status")

    response, code = filter_inventory(status)

    return jsonify(response), code


@inventory_bp.get("/blood-bank/<int:blood_bank_id>")
def inventory_for_bank(blood_bank_id):
    response, code = get_inventory_by_blood_bank(blood_bank_id)
    return jsonify(response), code