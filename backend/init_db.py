from app import create_app, db
# Import all models here so that Flask-Migrate can detect them
from models import MachineMaintenanceLog, ScrapSale, Payment

def initialize_database():
    """Creates database tables from SQLAlchemy models if they don't exist."""
    app = create_app()
    with app.app_context():
        print("Initializing database and creating tables...")
        db.create_all()
        print("Database tables created (if they didn't exist).")
        print("To manage migrations, use Flask-Migrate commands:")
        print("  flask db init (only once per project)")
        print("  flask db migrate -m \"Initial migration\"")
        print("  flask db upgrade")

if __name__ == '__main__':
    confirmation = input("This will create database tables. Are you sure? (yes/no): ")
    if confirmation.lower() == 'yes':
        initialize_database()
    else:
        print("Database initialization cancelled.")
