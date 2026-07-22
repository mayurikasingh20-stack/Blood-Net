import re
from datetime import date

VALID_BLOOD_GROUPS = {
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
}

def is_valid_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None


def normalize_phone(phone):
    if not phone:
        return ""

    digits = re.sub(r"\D+", "", str(phone)).strip()
    if not digits:
        return ""

    if len(digits) == 12 and digits.startswith("91"):
        return digits[2:]
    if len(digits) == 11 and digits.startswith("0"):
        return digits[1:]

    return digits

def validate_inventory_data(data):
    errors = {}

    # Blood Group
    blood_group = data.get("blood_group")
    if not blood_group:
        errors["blood_group"] = "Blood group is required."
    elif blood_group not in VALID_BLOOD_GROUPS:
        errors["blood_group"] = "Invalid blood group."

    # Units
    units = data.get("units")
    if units is None:
        errors["units"] = "Units are required."
    else:
        try:
            units = int(units)
            if units <= 0:
                errors["units"] = "Units must be greater than 0."
        except (TypeError, ValueError):
            errors["units"] = "Units must be an integer."

    # Collection Date
    collection_date = data.get("collection_date")
    if not collection_date:
        errors["collection_date"] = "Collection date is required."

    # Expiry Date
    expiry_date = data.get("expiry_date")
    if not expiry_date:
        errors["expiry_date"] = "Expiry date is required."

    return errors
