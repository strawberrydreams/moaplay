from flask import Blueprint, request, session
from sqlalchemy import or_, and_
from app.models import db
from app.models.event import Event
from app.models.user import User
from app.models.tag import Tag
from app.models.event_tag import EventTag
from app.models.enums import EventStatus, UserRole
from datetime import datetime

event_bp = Blueprint('events', __name__)

# ==================== Helper Functions ====================

def get_current_user():
    """현재 로그인한 사용자 조회"""
    user_id = session.get('id')
    if not user_id:
        return None
    return db.session.get(User, user_id)


def login_required(f):
    """로그인 필수 데코레이터"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'id' not in session:
            return {
                "error_code": "UNAUTHORIZED",
                "message": "로그인이 필요합니다."
            }, 401
        return f(*args, **kwargs)
    return decorated_function


def role_required(allowed_roles):
    """역할 권한 체크 데코레이터"""
    from functools import wraps
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            if not user:
                return {
                    "error_code": "UNAUTHORIZED",
                    "message": "로그인이 필요합니다."
                }, 401
            
            if user.role not in allowed_roles:
                return {
                    "error_code": "PERMISSION_DENIED",
                    "message": "권한이 없습니다."
                }, 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def can_view_event(event, user):
    """행사 조회 권한 체크"""
    # approved는 전체 공개
    if event.status == EventStatus.APPROVED:
        return True
    
    # 비로그인 사용자는 approved만 볼 수 있음
    if not user:
        return False
    
    # pending/rejected는 작성자 + 관리자만
    if user.id == event.host_id or user.role == UserRole.ADMIN:
        return True
    
    return False


def process_tags(tag_names):
    """태그 이름 리스트를 Tag 객체로 변환 (없으면 생성)"""
    tags = []
    for name in tag_names:
        tag = db.session.query(Tag).filter_by(name=name).first()
        if not tag:
            tag = Tag(name=name)
            db.session.add(tag)
        tags.append(tag)
    return tags


# ==================== 1. POST /api/events - 행사 신청 ====================

@event_bp.route('/', methods=['POST'])
@login_required
@role_required([UserRole.HOST, UserRole.ADMIN])
def create_event():
    """행사 신청 (HOST, ADMIN만 가능)"""
    data = request.get_json()
    
    # 필수 필드 검증
    required_fields = ['title', 'start_date', 'end_date', 'location', 'description', 'phone']
    missing_fields = [field for field in required_fields if not data.get(field)]
    
    if missing_fields:
        return {
            "error_code": "MISSING_FIELDS",
            "message": f"필수 필드가 누락되었습니다: {', '.join(missing_fields)}"
        }, 400
    
    try:
        # 날짜 파싱
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        # 날짜 유효성 검증
        if end_date < start_date:
            return {
                "error_code": "INVALID_DATE_RANGE",
                "message": "종료일은 시작일보다 이후여야 합니다."
            }, 400
        
        # 행사 생성
        event = Event(
            title=data['title'],
            summary=data.get('summary'),
            organizer=data.get('organizer'),
            hosted_by=data.get('hosted_by'),
            start_date=start_date,
            end_date=end_date,
            location=data['location'],
            description=data['description'],
            phone=data['phone'],
            image_urls=data.get('image_urls', []),
            host_id=session['id'],
            status=EventStatus.PENDING
        )
        
        db.session.add(event)
        db.session.flush()  # ID 생성을 위해
        
        # 태그 처리
        tag_names = data.get('tag_names', [])
        if tag_names:
            tags = process_tags(tag_names)
            for tag in tags:
                event_tag = EventTag(event_id=event.id, tag_id=tag.id)
                db.session.add(event_tag)
        
        db.session.commit()
        
        return event.to_dict(), 201
        
    except ValueError as e:
        return {
            "error_code": "INVALID_DATE_FORMAT",
            "message": "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)"
        }, 400
    except Exception as e:
        db.session.rollback()
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "행사 생성 중 오류가 발생했습니다."
        }, 500


# ==================== 2. GET /api/events - 행사 목록 조회 ====================

@event_bp.route('/', methods=['GET'])
def get_events():
    """행사 목록 조회 (페이징, 필터링, 정렬 지원)"""
    # 쿼리 파라미터
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    status = request.args.get('status', 'approved')
    location = request.args.get('location')
    sort = request.args.get('sort', 'created_at')  # created_at, view_count, start_date
    order = request.args.get('order', 'desc')  # asc, desc
    
    # 페이지 유효성 검증
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 10
    
    # 기본 쿼리
    query = db.session.query(Event)
    
    # 상태 필터
    try:
        status_enum = EventStatus(status)
        query = query.filter(Event.status == status_enum)
    except ValueError:
        return {
            "error_code": "INVALID_STATUS",
            "message": "유효하지 않은 상태값입니다."
        }, 400
    
    # 지역 필터
    if location:
        query = query.filter(Event.location.contains(location))
    
    # 정렬
    if sort == 'view_count':
        order_column = Event.view_count
    elif sort == 'start_date':
        order_column = Event.start_date
    else:
        order_column = Event.created_at
    
    if order == 'asc':
        query = query.order_by(order_column.asc())
    else:
        query = query.order_by(order_column.desc())
    
    # 페이징
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    events = [event.to_dict() for event in pagination.items]
    
    return {
        "events": events,
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages
        }
    }, 200


# ==================== 3. GET /api/events/{id} - 행사 상세 조회 ====================

@event_bp.route('/<int:event_id>', methods=['GET'])
def get_event(event_id):
    """행사 상세 조회"""
    event = db.session.get(Event, event_id)
    
    if not event:
        return {
            "error_code": "EVENT_NOT_FOUND",
            "message": "행사를 찾을 수 없습니다."
        }, 404
    
    # 권한 체크
    user = get_current_user()
    if not can_view_event(event, user):
        return {
            "error_code": "PERMISSION_DENIED",
            "message": "이 행사를 조회할 권한이 없습니다."
        }, 403
    
    # 조회수 증가 (approved만)
    if event.status == EventStatus.APPROVED:
        event.view_count += 1
        db.session.commit()
    
    return event.to_dict(), 200


# ==================== 4. PUT /api/events/{id} - 행사 수정 ====================

@event_bp.route('/<int:event_id>', methods=['PUT'])
@login_required
def update_event(event_id):
    """행사 수정 (작성자만 가능)"""
    event = db.session.get(Event, event_id)
    
    if not event:
        return {
            "error_code": "EVENT_NOT_FOUND",
            "message": "행사를 찾을 수 없습니다."
        }, 404
    
    user = get_current_user()
    
    # 작성자 확인
    if event.host_id != user.id:
        return {
            "error_code": "PERMISSION_DENIED",
            "message": "행사를 수정할 권한이 없습니다."
        }, 403
    
    data = request.get_json()
    
    try:
        # 수정 가능한 필드 업데이트
        if 'title' in data:
            event.title = data['title']
        if 'summary' in data:
            event.summary = data['summary']
        if 'organizer' in data:
            event.organizer = data['organizer']
        if 'hosted_by' in data:
            event.hosted_by = data['hosted_by']
        if 'start_date' in data:
            event.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        if 'end_date' in data:
            event.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        if 'location' in data:
            event.location = data['location']
        if 'description' in data:
            event.description = data['description']
        if 'phone' in data:
            event.phone = data['phone']
        if 'image_urls' in data:
            event.image_urls = data['image_urls']
        
        # 날짜 유효성 검증
        if event.end_date < event.start_date:
            return {
                "error_code": "INVALID_DATE_RANGE",
                "message": "종료일은 시작일보다 이후여야 합니다."
            }, 400
        
        # 태그 수정
        if 'tag_names' in data:
            # 기존 태그 관계 삭제
            db.session.query(EventTag).filter_by(event_id=event.id).delete()
            
            # 새 태그 추가
            tag_names = data['tag_names']
            if tag_names:
                tags = process_tags(tag_names)
                for tag in tags:
                    event_tag = EventTag(event_id=event.id, tag_id=tag.id)
                    db.session.add(event_tag)
        
        event.updated_at = datetime.now()
        db.session.commit()
        
        return event.to_dict(), 200
        
    except ValueError as e:
        return {
            "error_code": "INVALID_DATE_FORMAT",
            "message": "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)"
        }, 400
    except Exception as e:
        db.session.rollback()
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "행사 수정 중 오류가 발생했습니다."
        }, 500


# ==================== 5. DELETE /api/events/{id} - 행사 삭제 ====================

@event_bp.route('/<int:event_id>', methods=['DELETE'])
@login_required
def delete_event(event_id):
    """행사 삭제 (작성자 + 관리자만 가능)"""
    event = db.session.get(Event, event_id)
    
    if not event:
        return {
            "error_code": "EVENT_NOT_FOUND",
            "message": "행사를 찾을 수 없습니다."
        }, 404
    
    user = get_current_user()
    
    # 권한 체크 (작성자 또는 관리자)
    if event.host_id != user.id and user.role != UserRole.ADMIN:
        return {
            "error_code": "PERMISSION_DENIED",
            "message": "행사를 삭제할 권한이 없습니다."
        }, 403
    
    try:
        db.session.delete(event)
        db.session.commit()
        
        return {
            "message": "행사가 삭제되었습니다."
        }, 200
        
    except Exception as e:
        db.session.rollback()
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "행사 삭제 중 오류가 발생했습니다."
        }, 500


# ==================== 6. PUT /api/events/{id}/status - 행사 승인/거절 ====================

@event_bp.route('/<int:event_id>/status', methods=['PUT'])
@login_required
@role_required([UserRole.ADMIN])
def update_event_status(event_id):
    """행사 승인/거절 (관리자만 가능)"""
    event = db.session.get(Event, event_id)
    
    if not event:
        return {
            "error_code": "EVENT_NOT_FOUND",
            "message": "행사를 찾을 수 없습니다."
        }, 404
    
    data = request.get_json()
    
    if 'status' not in data:
        return {
            "error_code": "MISSING_FIELDS",
            "message": "status 필드가 필요합니다."
        }, 400
    
    try:
        new_status = EventStatus(data['status'])
        
        # rejected 시 거절 사유 필수
        if new_status == EventStatus.REJECTED:
            if not data.get('rejection_reason'):
                return {
                    "error_code": "MISSING_REJECTION_REASON",
                    "message": "거절 사유를 입력해주세요."
                }, 400
            event.rejection_reason = data['rejection_reason']
        else:
            event.rejection_reason = None
        
        event.status = new_status
        event.updated_at = datetime.now()
        db.session.commit()
        
        return event.to_dict(), 200
        
    except ValueError:
        return {
            "error_code": "INVALID_STATUS",
            "message": "유효하지 않은 상태값입니다. (approved, rejected)"
        }, 400
    except Exception as e:
        db.session.rollback()
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "상태 변경 중 오류가 발생했습니다."
        }, 500


# ==================== 7. GET /api/events/search - 행사 검색 ====================

@event_bp.route('/search', methods=['GET'])
def search_events():
    """행사 통합 검색"""
    query_string = request.args.get('q', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    if not query_string:
        return {
            "error_code": "MISSING_QUERY",
            "message": "검색어를 입력해주세요."
        }, 400
    
    # 페이지 유효성 검증
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 10
    
    # approved 상태의 행사만 검색
    query = db.session.query(Event).filter(
        Event.status == EventStatus.APPROVED
    ).filter(
        or_(
            Event.title.contains(query_string),
            Event.summary.contains(query_string),
            Event.location.contains(query_string),
            Event.description.contains(query_string),
            Event.organizer.contains(query_string),
            Event.hosted_by.contains(query_string)
        )
    ).order_by(Event.created_at.desc())
    
    # 페이징
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    events = [event.to_dict() for event in pagination.items]
    
    return {
        "events": events,
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages
        }
    }, 200