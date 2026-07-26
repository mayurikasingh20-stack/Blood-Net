from flask import Blueprint
from app.services.blood_request_service import get_top_requests

public_bp = Blueprint("public", __name__, url_prefix="/api/public")


@public_bp.get("/requests/top")
def top_requests():
    return get_top_requests()
