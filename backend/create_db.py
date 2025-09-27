from app import create_app
from app.models import db

app = create_app()

with app.app_context():
    from app.models.user import User
    from app.models.event import Event
    from app.models.review import Review
    from app.models.schedule import Schedule
    from app.models.favorite import Favorite
    from app.models.tag import Tag
    from app.models.event_tag import EventTag

    db.create_all()
    print("데이터베이스 테이블이 생성되었습니다.")