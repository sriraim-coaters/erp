import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///default.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'http://localhost:3000' # Default React dev server
    DEBUG = os.environ.get('DEBUG', 'False').lower() in ('true', '1', 't')

# Example: If you have different configurations for development, testing, production
class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    # Add other production-specific settings, e.g., different database URI from environment

# Choose the config based on an environment variable, e.g., FLASK_CONFIG
# For simplicity, we'll default to DevelopmentConfig if FLASK_CONFIG is not set
# config_name = os.environ.get('FLASK_CONFIG') or 'development'

# if config_name == 'production':
#     app_config = ProductionConfig()
# else:
#     app_config = DevelopmentConfig()

# For this project, we'll directly use Config and let .env drive Debug.
app_config = Config()
