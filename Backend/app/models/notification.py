from app.extensions import db

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"),nullable=False)
    title = db.Column(db.String(150),nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime,server_default=db.func.now())
    
    def __repr__(self):
        return f"<Notification {self.id}>"