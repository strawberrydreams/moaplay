from flask import Blueprint

api_bp = Blueprint("api", __name__)

from .user import user_bp
from .auth import auth_bp
from .event import event_bp
from .review import review_bp
from .schedule import schedule_bp
from .favorite import favorite_bp
from .admin import admin_bp
from .upload import upload_bp
from .tag import tag_bp

api_bp.register_blueprint(user_bp, url_prefix="/users")
api_bp.register_blueprint(auth_bp, url_prefix="/auth")
api_bp.register_blueprint(event_bp, url_prefix="/events")
api_bp.register_blueprint(review_bp, url_prefix="/reviews")
api_bp.register_blueprint(schedule_bp, url_prefix="/schedules")
api_bp.register_blueprint(favorite_bp, url_prefix="/favorites")
api_bp.register_blueprint(admin_bp, url_prefix="/admin")
api_bp.register_blueprint(upload_bp, url_prefix="/upload")
api_bp.register_blueprint(tag_bp, url_prefix='/tags')