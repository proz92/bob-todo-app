from models import db

def init_db(app):
    """Initialize the database with the Flask app"""
    db.init_app(app)
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database initialized successfully!")

def reset_db(app):
    """Drop all tables and recreate them (use with caution!)"""
    with app.app_context():
        db.drop_all()
        db.create_all()
        print("Database reset successfully!")

# Made with Bob