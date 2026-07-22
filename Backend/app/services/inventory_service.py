from datetime import date, datetime, timedelta
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.blood_bank import BloodBank
from app.models.inventory import Inventory, InventoryStatus
from app.models.inventory_history import InventoryHistory, InventoryAction
from app.models.user import User
from app.utils.validators import validate_inventory_data, validate_inventory_adjustment


def get_inventory_by_blood_bank(blood_bank_id):
    blood_bank = db.session.get(BloodBank, blood_bank_id)
    if blood_bank is None:
        return {"error": "Blood bank not found."}, 404

    inventory = Inventory.query.filter_by(
        blood_bank_id=blood_bank.id
    ).all()

    result = []
    for item in inventory:
        result.append({
            "id": item.id,
            "blood_group": item.blood_group,
            "units": item.units,
            "status": item.status.value,
            "expiry_date": item.expiry_date.isoformat() if item.expiry_date else None,
        })

    return {"inventory": result, "blood_bank": blood_bank.facility_name, "blood_bank_id": blood_bank.id}, 200


def add_inventory(data):
    errors = validate_inventory_data(data)
    if errors:
        return {"errors": errors}, 400

    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)

    if not user:
        return {"error": "User not found."}, 404
    blood_bank = BloodBank.query.filter_by(user_id=user.id).first()

    if not blood_bank:
        return {"error": "Blood bank profile not found."}, 404

    units = int(data["units"])
    existing = Inventory.query.filter_by(
        blood_bank_id=blood_bank.id,
        blood_group=data["blood_group"]
    ).first()

    if existing:
        existing.units += units
        if existing.units == 0:
            existing.status = InventoryStatus.OUT_OF_STOCK
        elif existing.units <= 5:
            existing.status = InventoryStatus.LOW_STOCK
        else:
            existing.status = InventoryStatus.AVAILABLE
        db.session.commit()
        return {"message": "Inventory updated successfully."}, 200

    inventory = Inventory(
        blood_bank_id=blood_bank.id,
        blood_group=data["blood_group"],
        units=units,
        collection_date=datetime.strptime(
            data["collection_date"],
            "%Y-%m-%d",
        ).date(),
        expiry_date=datetime.strptime(
            data["expiry_date"],
            "%Y-%m-%d",
        ).date(),
    )
    if inventory.units == 0:
        inventory.status = InventoryStatus.OUT_OF_STOCK
    elif inventory.units <= 5:
        inventory.status = InventoryStatus.LOW_STOCK
    else:
        inventory.status = InventoryStatus.AVAILABLE

    db.session.add(inventory)
    db.session.commit()

    return {
        "message": "Inventory added successfully."
    }, 201


def adjust_inventory(data):
    errors = validate_inventory_adjustment(data)
    if errors:
        return {"errors": errors}, 400

    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return {"error": "User not found."}, 404

    blood_bank = BloodBank.query.filter_by(user_id=user.id).first()
    if not blood_bank:
        return {"error": "Blood bank profile not found."}, 404

    action = data["action"]
    blood_group = data["blood_group"]
    units = int(data["units"])

    existing = Inventory.query.filter_by(
        blood_bank_id=blood_bank.id,
        blood_group=blood_group,
    ).first()

    if action == "Add Units":
        if existing:
            existing.units += units
        else:
            today = date.today()
            existing = Inventory(
                blood_bank_id=blood_bank.id,
                blood_group=blood_group,
                units=units,
                collection_date=today,
                expiry_date=today + timedelta(days=42),
            )
            db.session.add(existing)

        if existing.units == 0:
            existing.status = InventoryStatus.OUT_OF_STOCK
        elif existing.units <= 5:
            existing.status = InventoryStatus.LOW_STOCK
        else:
            existing.status = InventoryStatus.AVAILABLE

        history = InventoryHistory(
            blood_bank_id=blood_bank.id,
            blood_group=blood_group,
            action=InventoryAction.ADDED,
            units=units,
        )
        db.session.add(history)
        db.session.commit()

        return {
            "message": f"{units} units of {blood_group} blood added successfully.",
            "blood_group": blood_group,
            "total_units": existing.units,
            "status": existing.status.value,
        }, 200

    elif action == "Reduce Units":
        if not existing:
            return {
                "error": f"No inventory found for {blood_group}."
            }, 404

        if existing.units < units:
            return {
                "error": "Cannot reduce more units than are currently available."
            }, 400

        existing.units -= units

        if existing.units == 0:
            existing.status = InventoryStatus.OUT_OF_STOCK
        elif existing.units <= 5:
            existing.status = InventoryStatus.LOW_STOCK
        else:
            existing.status = InventoryStatus.AVAILABLE

        history = InventoryHistory(
            blood_bank_id=blood_bank.id,
            blood_group=blood_group,
            action=InventoryAction.REDUCED,
            units=units,
        )
        db.session.add(history)
        db.session.commit()

        return {
            "message": f"{units} units of {blood_group} blood removed successfully.",
            "blood_group": blood_group,
            "total_units": existing.units,
            "status": existing.status.value,
        }, 200


def get_inventory():
    """
    Return all inventory belonging to the logged-in blood bank.
    """

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if not user:
        return {"error": "User not found."}, 404

    blood_bank = BloodBank.query.filter_by(user_id=user.id).first()

    if not blood_bank:
        return {"error": "Blood bank profile not found."}, 404

    inventory = Inventory.query.filter_by(
        blood_bank_id=blood_bank.id
    ).all()

    inventory_list = []

    for item in inventory:
        inventory_list.append({
            "id": item.id,
            "blood_group": item.blood_group,
            "units": item.units,
            "collection_date": item.collection_date.isoformat() if item.collection_date else None,
            "expiry_date": item.expiry_date.isoformat() if item.expiry_date else None,
            "status": item.status.value,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None
        })

    return {
        "inventory": inventory_list
    }, 200
    
def get_inventory_by_id(inventory_id):
    """
    Return a single inventory item.
    """

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if not user:
        return {"error": "User not found."}, 404

    blood_bank = BloodBank.query.filter_by(user_id=user.id).first()

    if not blood_bank:
        return {"error": "Blood bank profile not found."}, 404

    item = Inventory.query.filter_by(
        id=inventory_id,
        blood_bank_id=blood_bank.id
    ).first()

    if not item:
        return {"error": "Inventory not found."}, 404

    return {
        "inventory": {
            "id": item.id,
            "blood_group": item.blood_group,
            "units": item.units,
            "collection_date": item.collection_date.isoformat(),
            "expiry_date": item.expiry_date.isoformat(),
            "status": item.status.value,
            "created_at": item.created_at.isoformat(),
            "updated_at": item.updated_at.isoformat()
        }
    }, 200
    
def update_inventory(inventory_id, data):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)

    if not user:
        return {"error": "User not found."}, 404

    blood_bank = BloodBank.query.filter_by(user_id=user.id).first()

    if not blood_bank:
        return {"error": "Blood bank profile not found."}, 404

    inventory = Inventory.query.filter_by(
        id=inventory_id,
        blood_bank_id=blood_bank.id
    ).first()

    if not inventory:
        return {"error": "Inventory not found."}, 404

    if "blood_group" in data:
        inventory.blood_group = data["blood_group"]

    if "units" in data:
        inventory.units = int(data["units"])

    if "collection_date" in data:
        inventory.collection_date = datetime.strptime(
            data["collection_date"],
            "%Y-%m-%d"
        ).date()

    if "expiry_date" in data:
        inventory.expiry_date = datetime.strptime(
            data["expiry_date"],
            "%Y-%m-%d"
        ).date()

    if inventory.units == 0:
        inventory.status = InventoryStatus.OUT_OF_STOCK
    elif inventory.units <= 5:
        inventory.status = InventoryStatus.LOW_STOCK
    else:
        inventory.status = InventoryStatus.AVAILABLE

    db.session.commit()

    return {
        "message": "Inventory updated successfully."
    }, 200
    
def delete_inventory(inventory_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)

    if not user:
        return {"error": "User not found."}, 404

    blood_bank = BloodBank.query.filter_by(user_id=user.id).first()

    if not blood_bank:
        return {"error": "Blood bank profile not found."}, 404

    inventory = Inventory.query.filter_by(
        id=inventory_id,
        blood_bank_id=blood_bank.id
    ).first()

    if not inventory:
        return {"error": "Inventory not found."}, 404

    db.session.delete(inventory)
    db.session.commit()

    return {
        "message": "Inventory deleted successfully."
    }, 200
    
def search_inventory(blood_group):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)

    if not user:
        return {"error": "User not found"}, 404

    blood_bank = BloodBank.query.filter_by(user_id=user.id).first()

    if not blood_bank:
        return {"error": "Blood bank not found"}, 404

    inventory = Inventory.query.filter(
        Inventory.blood_bank_id == blood_bank.id,
        Inventory.blood_group.ilike(f"%{blood_group}%")
    ).all()

    result = []

    for item in inventory:
        result.append({
            "id": item.id,
            "blood_group": item.blood_group,
            "units": item.units,
            "status": item.status.value,
            "expiry_date": item.expiry_date.isoformat()
        })

    return {"inventory": result}, 200
    
def filter_inventory(status):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)

    if not user:
        return {"error": "User not found"}, 404

    blood_bank = BloodBank.query.filter_by(user_id=user.id).first()

    if not blood_bank:
        return {"error": "Blood bank not found"}, 404

    inventory = Inventory.query.filter_by(
        blood_bank_id=blood_bank.id,
        status=InventoryStatus(status)
    ).all()

    result = []

    for item in inventory:

        result.append({
            "id": item.id,
            "blood_group": item.blood_group,
            "units": item.units,
            "status": item.status.value
        })

    return {"inventory": result}, 200