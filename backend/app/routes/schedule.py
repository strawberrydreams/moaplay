from flask import Blueprint, request, session
from sqlalchemy import and_, extract
from app.models import db
from app.models.schedule import Schedule
from app.models.event import Event
from app.models.user import User
from app.models.enums import EventStatus
from datetime import datetime, date

schedule_bp = Blueprint('schedules', __name__)

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


# ==================== 1. POST / - 일정 추가 ====================

@schedule_bp.route('/', methods=['POST'])
@login_required
def create_schedule():
    """일정 추가 (로그인 사용자만 가능)"""
    data = request.get_json()
    
    # 필수 필드 검증
    if 'event_id' not in data:
        return {
            "error_code": "MISSING_FIELDS",
            "message": "event_id 필드가 필요합니다."
        }, 400
    
    event_id = data['event_id']
    user_id = session['id']
    
    # 행사 존재 확인
    event = db.session.get(Event, event_id)
    if not event:
        return {
            "error_code": "EVENT_NOT_FOUND",
            "message": "행사를 찾을 수 없습니다."
        }, 404
    
    # approved 행사만 일정 추가 가능
    if event.status != EventStatus.APPROVED:
        return {
            "error_code": "EVENT_NOT_APPROVED",
            "message": "승인된 행사만 일정에 추가할 수 있습니다."
        }, 403
    
    # 중복 등록 확인
    existing = db.session.query(Schedule).filter_by(
        user_id=user_id,
        event_id=event_id
    ).first()
    
    if existing:
        return {
            "error_code": "DUPLICATE_SCHEDULE",
            "message": "이미 일정에 추가된 행사입니다."
        }, 409
    
    try:
        # 일정 생성
        schedule = Schedule(
            user_id=user_id,
            event_id=event_id
        )
        
        db.session.add(schedule)
        db.session.commit()
        
        return schedule.to_dict(), 201
        
    except Exception as e:
        db.session.rollback()
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "일정 추가 중 오류가 발생했습니다."
        }, 500


# ==================== 2. GET / - 일정 목록 조회 ====================

@schedule_bp.route('/', methods=['GET'])
@login_required
def get_schedules():
    """
    일정 목록 조회 (로그인 사용자만 가능)
    
    필터링 옵션:
    - 전체: 파라미터 없음
    - 월별: ?year=2025&month=10
    - 일별: ?date=2025-10-15
    """
    user_id = session['id']
    
    # 기본 쿼리 (본인의 일정만)
    query = db.session.query(Schedule).filter_by(user_id=user_id)
    
    # 필터링 옵션 확인
    date_param = request.args.get('date')
    year_param = request.args.get('year', type=int)
    month_param = request.args.get('month', type=int)
    
    try:
        # 일별 필터 (우선순위 높음)
        if date_param:
            filter_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            
            # 해당 날짜에 진행 중인 행사 (start_date <= filter_date <= end_date)
            query = query.join(Event).filter(
                and_(
                    Event.start_date <= filter_date,
                    Event.end_date >= filter_date
                )
            )
        
        # 월별 필터
        elif year_param and month_param:
            # 해당 월에 겹치는 행사
            # (행사 시작일이 해당 월 이전 또는 해당 월) AND (행사 종료일이 해당 월 이후 또는 해당 월)
            query = query.join(Event).filter(
                and_(
                    extract('year', Event.start_date) == year_param,
                    extract('month', Event.start_date) == month_param
                ) | and_(
                    extract('year', Event.end_date) == year_param,
                    extract('month', Event.end_date) == month_param
                ) | and_(
                    Event.start_date <= date(year_param, month_param, 1),
                    Event.end_date >= date(year_param, month_param, 1)
                )
            )
        
        # 정렬: 행사 시작일 기준 오름차순
        schedules = query.join(Event).order_by(Event.start_date.asc()).all()
        
        return {
            "schedules": [schedule.to_dict() for schedule in schedules],
            "total": len(schedules)
        }, 200
        
    except ValueError:
        return {
            "error_code": "INVALID_DATE_FORMAT",
            "message": "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)"
        }, 400
    except Exception as e:
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "일정 조회 중 오류가 발생했습니다."
        }, 500


# ==================== 3. DELETE /<id> - 일정 삭제 ====================

@schedule_bp.route('/<int:schedule_id>', methods=['DELETE'])
@login_required
def delete_schedule(schedule_id):
    """일정 삭제 (본인만 가능)"""
    schedule = db.session.get(Schedule, schedule_id)
    
    if not schedule:
        return {
            "error_code": "SCHEDULE_NOT_FOUND",
            "message": "일정을 찾을 수 없습니다."
        }, 404
    
    user_id = session['id']
    
    # 본인의 일정인지 확인
    if schedule.user_id != user_id:
        return {
            "error_code": "PERMISSION_DENIED",
            "message": "본인의 일정만 삭제할 수 있습니다."
        }, 403
    
    try:
        db.session.delete(schedule)
        db.session.commit()
        
        return {
            "message": "일정이 삭제되었습니다."
        }, 200
        
    except Exception as e:
        db.session.rollback()
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "일정 삭제 중 오류가 발생했습니다."
        }, 500
