from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate

from config import app_config

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(app_config)

    CORS(app, resources={r"/api/*": {"origins": app_config.FRONTEND_URL}})
    db.init_app(app)
    migrate.init_app(app, db)

    # Import models here to ensure they are registered with SQLAlchemy
    # before any database operations or migrations are run.
    # This also makes them available for flask db commands.
    from models import MachineMaintenanceLog, ScrapSale, Payment

    # Register Blueprints for routes
    from routes.maintenance_routes import maintenance_bp
    from routes.scrap_routes import scrap_bp
    app.register_blueprint(maintenance_bp, url_prefix='/api/machines')
    app.register_blueprint(scrap_bp, url_prefix='/api/scrap-sales')

    @app.route('/api/health')
    def health_check():
        return {"status": "healthy", "message": "Backend is running!"}

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=app_config.DEBUG, host='0.0.0.0', port=5000)
