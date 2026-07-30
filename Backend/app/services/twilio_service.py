from twilio.rest import Client
from flask import current_app


def _get_client():
    sid = current_app.config.get("TWILIO_ACCOUNT_SID")
    token = current_app.config.get("TWILIO_AUTH_TOKEN")
    if not sid or not token:
        raise RuntimeError("Twilio credentials not configured")
    return Client(sid, token)


def send_otp(phone):
    service_sid = current_app.config.get("TWILIO_VERIFY_SERVICE_SID")
    if not service_sid:
        raise RuntimeError("Twilio Verify service SID not configured")

    client = _get_client()
    verification = client.verify.v2.services(service_sid).verifications.create(
        to=phone, channel="sms"
    )
    return verification.status


def check_otp(phone, code):
    service_sid = current_app.config.get("TWILIO_VERIFY_SERVICE_SID")
    if not service_sid:
        raise RuntimeError("Twilio Verify service SID not configured")

    client = _get_client()
    verification_check = client.verify.v2.services(service_sid).verification_checks.create(
        to=phone, code=code
    )
    return verification_check.status
