import os
from flask import Flask
from .models import db
from flask_migrate import Migrate
from flask_cors import CORS
from flask_login import LoginManager
from dotenv import load_dotenv


# LoginManager 인스턴스 생성
login_manager = LoginManager()

load_dotenv()


def create_app(test_config=None):
    base_dir = os.path.abspath(os.path.dirname(__file__))
    static_folder = os.path.join(base_dir, '..', 'static')

    app = Flask(__name__, instance_relative_config=True, static_folder=static_folder, static_url_path='/static')
    
    app.config.from_mapping(
        SECRET_KEY = 'dev',
        DATABASE = os.path.join(app.instance_path, "moaplay_dev.sqlite"),
        SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(app.instance_path, "moaplay_dev.db")}'
    )

    if test_config == None:
        app.config.from_pyfile("config.py", silent=True)
    else:
        app.config.from_pyfile(test_config)

    # 인스턴스 폴더 생성
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # db 연결
    db.init_app(app)
    
    # Flask-Login 초기화
    login_manager.init_app(app)
    login_manager.session_protection = 'strong'
    
    # migrate
    migrate = Migrate(app, db)
    
    # cors 설정
    CORS(app, 
     resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}, supports_credentials=True)

    # 청사진 연결
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    return app


# Flask-Login user_loader 콜백
@login_manager.user_loader
def load_user(user_id):
    from .models.user import User
    return db.session.get(User, int(user_id))


# unauthorized 응답
@login_manager.unauthorized_handler
def unauthorized():
    return {
        "error_code": "UNAUTHORIZED",
        "message": "로그인이 필요합니다."
    }, 401