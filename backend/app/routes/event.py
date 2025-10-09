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
    """행사 신청"""
    try:
        data = request.get_json()
        current_user_id = session["id"]
        
        # 현재 사용자 확인
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({
                'error': '사용자를 찾을 수 없습니다.',
                'code': 'USER_NOT_FOUND'
            }), 404
        
        # 필수 필드 검증
        required_fields = ['title', 'start_date', 'end_date', 'location', 'description', 'phone']
        for field in required_fields:
            if not data.get(field):
                return {
                    'error': f'{field} 필드는 필수입니다.',
                    'code': 'MISSING_FIELD',
                    'field': field
                }, 400
        
        # 데이터 정리
        title = data['title'].strip()
        summary = data.get('summary', '').strip() or None
        location = data['location'].strip()
        description = data['description'].strip()
        phone = data['phone'].strip()
        tag_names = data.get('tag_names', [])
        image_urls = data.get('image_urls', [])
        
        # 날짜 파싱
        try:
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'error': '날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식을 사용하세요.',
                'code': 'INVALID_DATE_FORMAT'
            }), 400
        
        # 날짜 유효성 검증
        if start_date > end_date:
            return jsonify({
                'error': '시작일은 종료일보다 빠르거나 같아야 합니다.',
                'code': 'INVALID_DATE_RANGE'
            }), 400
        
        if start_date < date.today():
            return jsonify({
                'error': '시작일은 오늘 이후여야 합니다.',
                'code': 'INVALID_START_DATE'
            }), 400
        
        # 제목 길이 검증 (1-255자)
        if len(title) < 1 or len(title) > 255:
            return jsonify({
                'error': '제목은 1-255자여야 합니다.',
                'code': 'INVALID_TITLE'
            }), 400
        
        # 전화번호 형식 검증
        phone_pattern = r'^[\d\-\s\(\)]{10,20}$'
        if not re.match(phone_pattern, phone.replace('-', '').replace(' ', '').replace('(', '').replace(')', '')):
            return jsonify({
                'error': '유효한 전화번호 형식이 아닙니다.',
                'code': 'INVALID_PHONE'
            }), 400
        
        # 새 행사 생성
        new_event = Event(
            title=title,
            summary=summary,
            start_date=start_date,
            end_date=end_date,
            location=location,
            description=description,
            phone=phone,
            host_id=user.id,
            status=EventStatus.PENDING
        )
        
        # 데이터베이스에 행사 저장
        db.session.add(new_event)
        db.session.flush()  # ID 생성을 위해 flush
        
        # 태그 처리
        tag_objects = []
        for tag_name in tag_names:
            tag_name = tag_name.strip()
            if not tag_name:
                continue
                
            # 기존 태그 찾기 또는 새로 생성
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
                db.session.flush()  # ID 생성을 위해 flush
            
            # 중복 체크 후 연결
            existing_connection = EventTag.query.filter_by(
                event_id=new_event.id, 
                tag_id=tag.id
            ).first()
            
            if not existing_connection:
                event_tag = EventTag(event_id=new_event.id, tag_id=tag.id)
                db.session.add(event_tag)
                tag_objects.append(tag)
        
        # 커밋
        db.session.commit()
        
        # 응답 데이터 준비
        tags_data = [{'id': tag.id, 'name': tag.name} for tag in tag_objects]
        
        response_data = {
            'id': new_event.id,
            'title': new_event.title,
            'summary': new_event.summary,
            'start_date': new_event.start_date.isoformat(),
            'end_date': new_event.end_date.isoformat(),
            'location': new_event.location,
            'description': new_event.description,
            'phone': new_event.phone,
            'tags': tags_data,
            'image_urls': image_urls,
            'host': {
                'id': user.id,
                'user_id': user.user_id,
                'nickname': user.nickname
            },
            'status': new_event.status.value,
            'created_at': new_event.created_at.isoformat() + 'Z'
        }
        
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating event: {str(e)}")  # 디버깅용
        return jsonify({
            'error': '서버 오류가 발생했습니다.',
            'code': 'INTERNAL_SERVER_ERROR'
        }), 500

@event_bp.route('/<int:event_id>', methods=['GET'])
def get_event(event_id):
    """행사 상세 조회"""
    try:
        # 행사 조회
        event = Event.query.get_or_404(event_id)
        
        # 태그 정보 가져오기
        tags_data = []
        for event_tag in event.tags:
            tags_data.append({
                'id': event_tag.tag.id,
                'name': event_tag.tag.name
            })
        
        # 응답 데이터 준비
        response_data = {
            'id': event.id,
            'title': event.title,
            'summary': event.summary,
            'start_date': event.start_date.isoformat(),
            'end_date': event.end_date.isoformat(),
            'location': event.location,
            'description': event.description,
            'phone': event.phone,
            'tags': tags_data,
            'image_urls': [],  # TODO: 이미지 URL 처리
            'host': {
                'id': event.host.id,
                'user_id': event.host.user_id,
                'nickname': event.host.nickname,
                'profile_image': event.host.profile_image
            },
            'status': event.status.value,
            'rejection_reason': event.rejection_reason,
            'created_at': event.created_at.isoformat() + 'Z',
            'updated_at': event.updated_at.isoformat() + 'Z'
        }
        
        return response_data, 200
        
    except Exception as e:
        print(f"Error getting event: {str(e)}")  # 디버깅용
        return jsonify({
            'error': '서버 오류가 발생했습니다.',
            'code': 'INTERNAL_SERVER_ERROR'
        }), 500