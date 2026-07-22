import os
from datetime import date
from flask import Flask
from app.config import Config
from app.extensions import db, jwt
from app.routes.auth import auth_bp
from flask_cors import CORS
from app.routes.admin import admin_bp
from app.routes.donor import donor_bp
from app.routes.patient import patient_bp
from app.routes.blood_bank import blood_bank_bp
from app.routes.blood_request import blood_request_bp
from app.routes.donation import donation_bp
from app.routes.notification import notification_bp
from app.routes.inventory import inventory_bp
from app.routes.public_blood_bank import public_bb_bp
from app.routes.map import map_bp
from app.routes.camps import camps_bp
from app.models.user import User
from app.models.inventory_history import InventoryHistory
from app.utils.password import hash_password


def seed_admin_users():
    admins = [
        {"email": "iamadmin@gmail.com", "password": "password", "first_name": "Admin", "last_name": "User", "phone": "+91 99999 00001"},
        {"email": "vinay@gmail.com", "password": "password2", "first_name": "Vinay", "last_name": "Kumar", "phone": "+91 99999 00002"},
    ]
    for admin in admins:
        if not User.query.filter_by(email=admin["email"]).first():
            new_admin = User(
                first_name=admin["first_name"],
                last_name=admin["last_name"],
                email=admin["email"],
                phone=admin["phone"],
                password_hash=hash_password(admin["password"]),
                role="admin",
                gender="Male",
                dob=date(1990, 1, 1),
                city="System",
            )
            db.session.add(new_admin)
    db.session.commit()


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    os.makedirs(app.instance_path, exist_ok=True)

    app.config.from_object(Config)
    
    CORS(app,resources={
        r"/*":{
            "origins":["http://localhost:5173", "http://127.0.0.1:5173"]
        }
    })
    db.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(donor_bp)
    app.register_blueprint(patient_bp)
    app.register_blueprint(blood_bank_bp)
    app.register_blueprint(blood_request_bp)
    app.register_blueprint(donation_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(public_bb_bp)
    app.register_blueprint(map_bp)
    app.register_blueprint(camps_bp)
    with app.app_context():
        db.create_all()
        seed_admin_users()

    return app
