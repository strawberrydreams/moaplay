from flask import Blueprint

api_bp = Blueprint("api", __name__)

from .user import user_bp
from .auth import auth_bp
# from .event import event_bp
from .tag import tag_bp


api_bp.register_blueprint(user_bp, url_prefix="/users")
api_bp.register_blueprint(auth_bp, url_prefix="/auth")
# api_bp.register_blueprint(event_bp, url_prefix="/events")
api_bp.register_blueprint(tag_bp, url_prefix="/tags")