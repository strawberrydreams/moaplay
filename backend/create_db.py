from app import create_app
from app.models import db

app = create_app()

with app.app_context():

    db.drop_all()
    db.create_all()
    print("데이터베이스 테이블이 생성되었습니다.")