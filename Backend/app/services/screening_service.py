from datetime import datetime, timedelta
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.donor import Donor

SCREENING_QUESTIONS = [
    {"id": 1, "question": "Do you feel healthy today?", "expected": "yes"},
    {"id": 2, "question": "Have you had fever, flu, cough, sore throat, or any infection during the past 14 days?", "expected": "no"},
    {"id": 3, "question": "Are you currently taking antibiotics or any prescription medication for an illness?", "expected": "no"},
    {"id": 4, "question": "Have you consumed alcohol within the last 24 hours?", "expected": "no"},
    {"id": 5, "question": "Have you received a tattoo or body piercing within the last 6 months?", "expected": "no"},
    {"id": 6, "question": "Have you undergone any major surgery during the last 6 months?", "expected": "no"},
    {"id": 7, "question": "Are you currently suffering from any serious illness? (Heart disease, Kidney disease, Cancer, Blood disorders)", "expected": "no"},
    {"id": 8, "question": "Have you donated blood anywhere else within the last 56 days?", "expected": "no"},
    {"id": 9, "question": "Has a doctor ever advised you not to donate blood?", "expected": "no"},
    {"id": 10, "question": "Are you willing to donate blood today voluntarily?", "expected": "yes"},
]


def check_donation_interval():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return {"message": "User not found."}, 404

    donor = Donor.query.filter_by(user_id=user.id).first()
    if not donor:
        return {"message": "Donor profile not found."}, 404

    eligible, next_date = donor.check_donation_interval()
    if eligible:
        return {
            "eligible": True,
            "message": "You are eligible based on donation interval."
        }, 200
    else:
        last = donor.last_donation_date
        next_due = last + timedelta(days=56)
        return {
            "eligible": False,
            "message": "You are currently not eligible to donate blood.",
            "last_donation_date": last.isoformat() if last else None,
            "next_eligible_date": next_due.isoformat(),
            "reason": f"You last donated blood on {last.strftime('%d/%m/%Y') if last else 'N/A'}. A minimum gap of 56 days is required before your next whole blood donation."
        }, 200


def submit_screening(data):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return {"message": "User not found."}, 404

    donor = Donor.query.filter_by(user_id=user.id).first()
    if not donor:
        return {"message": "Donor profile not found."}, 404

    answers = data.get("answers")
    if not answers or not isinstance(answers, list):
        return {"message": "Answers are required."}, 400

    if len(answers) != len(SCREENING_QUESTIONS):
        return {"message": "All questions must be answered."}, 400

    failed_reasons = []
    for ans in answers:
        qid = ans.get("id")
        user_answer = ans.get("answer", "").strip().lower()
        question = next((q for q in SCREENING_QUESTIONS if q["id"] == qid), None)
        if not question:
            continue
        if user_answer != question["expected"]:
            failed_reasons.append(question["question"])

    passed = len(failed_reasons) == 0

    donor.screening_completed = True
    donor.screening_date = datetime.utcnow()
    donor.screening_result = "passed" if passed else "failed"
    donor.failed_reason = "; ".join(failed_reasons) if failed_reasons else None

    db.session.commit()

    if passed:
        return {
            "eligible": True,
            "message": "You are eligible to donate blood.",
            "failed_reasons": []
        }, 200
    else:
        return {
            "eligible": False,
            "message": "You are currently not eligible to donate blood.",
            "failed_reasons": failed_reasons
        }, 200


def get_screening_questions():
    return {
        "questions": SCREENING_QUESTIONS
    }, 200
