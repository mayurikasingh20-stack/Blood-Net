from datetime import datetime
import enum

from app.extensions import db


class InventoryStatus(enum.Enum):
    AVAILABLE = "AVAILABLE"
    LOW_STOCK = "LOW_STOCK"
    OUT_OF_STOCK = "OUT_OF_STOCK"
    EXPIRED = "EXPIRED"


class Inventory(db.Model):
    __tablename__ = "inventory"

    __table_args__ = (
        db.UniqueConstraint("blood_bank_id", "blood_group", name="uq_blood_bank_blood_group"),
    )

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

    units = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    collection_date = db.Column(
        db.Date,
        nullable=False,
    )

    expiry_date = db.Column(
        db.Date,
        nullable=False,
    )

    status = db.Column(
        db.Enum(InventoryStatus),
        nullable=False,
        default=InventoryStatus.AVAILABLE,
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    blood_bank = db.relationship(
        "BloodBank",
        back_populates="inventory"
    )