from flask import Blueprint, request, jsonify, session
from app import db
from app.models.event import Event
from app.models.user import User
from app.models.tag import Tag
from app.models.event_tag import EventTag
from app.models.enums import EventStatus
from datetime import datetime, date
import re

event_bp = Blueprint('events', __name__)

@event_bp.route('/', methods=['POST'])
def create_event():
    data = request.get_json()

    # !필수 필드, 유효성 검사 추가 예정
    ################################

    title = data.get("title")
    summary = data.get("summary")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    location = data.get("location")
    description = data.get("description")
    phone = data.get("phone")
    image_urls = data.get("image_urls")
    host_id = current_user.id

    event = Event(title=title, summary=summary, start_date=start_date, 
                  end_date=end_date, location=location, description=description, 
                  phone=phone, image_urls=image_urls, host_id=host_id)
    
    # 해쉬태그가 없으면 추가 후 관계 테이블에 이벤트와 태그 연결
    hashtag = data.get("hashtag")

    db.session.add(event)
    db.session.commit()

    return event.to_dict(), 201

@event_bp.route('/<int:id>', methods=['GET'])
def get_event(id):
    event = Event.query.get_or_404(id, description="Event not found")

    # 후에 이벤트 게시물이 pending, rejected의 경우 작성자와 관리자만 볼수 있는 권한 확인 로직 추가

    return event.to_dict(), 200