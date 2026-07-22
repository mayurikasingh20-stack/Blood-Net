from datetime import datetime
import enum
from app.extensions import db


class InventoryAction(enum.Enum):
    ADDED = "Added"
    REDUCED = "Reduced"


class InventoryHistory(db.Model):
    __tablename__ = "inventory_history"

    id = db.Column(db.Integer, primary_key=True)

    blood_bank_id = db.Column(
        db.Integer,
        db.ForeignKey("blood_banks.id"),
        nullable=False,
    )

    blood_group = db.Column(
        db.String(5),
        nullable=False,
    )

    action = db.Column(
        db.Enum(InventoryAction),
        nullable=False,
    )

    units = db.Column(
        db.Integer,
        nullable=False,
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    blood_bank = db.relationship(
        "BloodBank",
        back_populates="inventory_history"
    )
