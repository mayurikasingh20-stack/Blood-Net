import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-this-development-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///blood_net.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
