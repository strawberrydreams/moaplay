import os
from flask import Flask
from .models import db
from flask_migrate import Migrate


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
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

    #db 연결
    db.init_app(app)
    #migrate
    migrate = Migrate(app, db)

    #청사진 연결
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    return app