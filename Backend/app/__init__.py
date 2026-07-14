from flask import Flask, jsonify
from flask_cors import CORS

from .config import Config
from .extensions import db,jwt

from app import models

def create_app():
    app=Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app,
         resources={
             r"/*":{
                 "origin":[
                     "http://localhost:5173","http://127.0.0.1:5173"]
                 }
         })
    db.init_app(app)
    jwt.init_app(app)
    
    from .routes.auth import auth_bp
    app.register_blueprint(auth_bp)
    
    @app.get("/")
    def health_check():
        return jsonify({
            "messsage" : "API is running",
            "status" : "ok"
        })
        
    with app.app_context():
        db.create_all()
        
    return app