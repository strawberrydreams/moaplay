from flask import Blueprint, request, session
from sqlalchemy import func, extract
from app.models import db
from app.models.event import Event
from app.models.user import User
from app.models.review import Review
from app.models.schedule import Schedule
from app.models.favorite import Favorite
from app.models.enums import EventStatus, UserRole
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

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


def admin_required(f):
    """관리자 권한 필수 데코레이터"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return {
                "error_code": "UNAUTHORIZED",
                "message": "로그인이 필요합니다."
            }, 401
        
        if user.role != UserRole.ADMIN:
            return {
                "error_code": "PERMISSION_DENIED",
                "message": "관리자 권한이 필요합니다."
            }, 403
        
        return f(*args, **kwargs)
    return decorated_function


# ==================== 1. GET /dashboard - 관리자 대시보드 ====================

@admin_bp.route('/dashboard', methods=['GET'])
@login_required
@admin_required
def get_dashboard():
    """관리자 대시보드 - 통계 데이터 조회"""
    try:
        # 1. 사용자 통계
        total_users = db.session.query(func.count(User.id)).scalar()
        total_hosts = db.session.query(func.count(User.id)).filter(User.role == UserRole.HOST).scalar()
        
        # 최근 30일 신규 가입자
        thirty_days_ago = datetime.now() - timedelta(days=30)
        new_users_30d = db.session.query(func.count(User.id)).filter(
            User.created_at >= thirty_days_ago
        ).scalar()
        
        # 2. 행사 통계
        total_events = db.session.query(func.count(Event.id)).scalar()
        pending_events = db.session.query(func.count(Event.id)).filter(
            Event.status == EventStatus.PENDING
        ).scalar()
        approved_events = db.session.query(func.count(Event.id)).filter(
            Event.status == EventStatus.APPROVED
        ).scalar()
        rejected_events = db.session.query(func.count(Event.id)).filter(
            Event.status == EventStatus.REJECTED
        ).scalar()
        
        # 최근 30일 생성된 행사
        new_events_30d = db.session.query(func.count(Event.id)).filter(
            Event.created_at >= thirty_days_ago
        ).scalar()
        
        # 3. 리뷰 통계
        total_reviews = db.session.query(func.count(Review.id)).scalar()
        average_rating = db.session.query(func.avg(Review.rating)).scalar()
        
        # 최근 30일 작성된 리뷰
        new_reviews_30d = db.session.query(func.count(Review.id)).filter(
            Review.created_at >= thirty_days_ago
        ).scalar()
        
        # 4. 일정/찜 통계
        total_schedules = db.session.query(func.count(Schedule.id)).scalar()
        total_favorites = db.session.query(func.count(Favorite.id)).scalar()
        
        # 5. 인기 행사 Top 5 (조회수 기준)
        popular_events = db.session.query(Event).filter(
            Event.status == EventStatus.APPROVED
        ).order_by(Event.view_count.desc()).limit(5).all()
        
        # 6. 최근 승인 대기 행사 5개
        recent_pending = db.session.query(Event).filter(
            Event.status == EventStatus.PENDING
        ).order_by(Event.created_at.desc()).limit(5).all()
        
        return {
            "statistics": {
                "users": {
                    "total": total_users,
                    "hosts": total_hosts,
                    "new_30d": new_users_30d
                },
                "events": {
                    "total": total_events,
                    "pending": pending_events,
                    "approved": approved_events,
                    "rejected": rejected_events,
                    "new_30d": new_events_30d
                },
                "reviews": {
                    "total": total_reviews,
                    "average_rating": round(float(average_rating), 1) if average_rating else 0.0,
                    "new_30d": new_reviews_30d
                },
                "engagement": {
                    "total_schedules": total_schedules,
                    "total_favorites": total_favorites
                }
            },
            "popular_events": [event.to_dict() for event in popular_events],
            "recent_pending": [event.to_dict() for event in recent_pending]
        }, 200
        
    except Exception as e:
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "대시보드 조회 중 오류가 발생했습니다."
        }, 500


# ==================== 2. GET /pending-list - 승인 대기 목록 ====================

@admin_bp.route('/pending-list', methods=['GET'])
@login_required
@admin_required
def get_pending_list():
    """승인 대기 중인 행사 목록 조회"""
    # 페이징 파라미터
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # 페이지 유효성 검증
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 20
    
    try:
        # pending 상태 행사 조회 (오래된 순)
        query = db.session.query(Event).filter(
            Event.status == EventStatus.PENDING
        ).order_by(Event.created_at.asc())
        
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
        
    except Exception as e:
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "승인 대기 목록 조회 중 오류가 발생했습니다."
        }, 500


# ==================== 3. GET /approved-list - 승인 완료 목록 ====================

@admin_bp.route('/approved-list', methods=['GET'])
@login_required
@admin_required
def get_approved_list():
    """승인 완료된 행사 목록 조회"""
    # 페이징 파라미터
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # 페이지 유효성 검증
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 20
    
    try:
        # approved 상태 행사 조회 (최신순)
        query = db.session.query(Event).filter(
            Event.status == EventStatus.APPROVED
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
        
    except Exception as e:
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "승인 완료 목록 조회 중 오류가 발생했습니다."
        }, 500


# ==================== 4. GET /events-list - 전체 행사 관리 ====================

@admin_bp.route('/events-list', methods=['GET'])
@login_required
@admin_required
def get_events_list():
    """전체 행사 목록 조회 (상태 필터링 가능)"""
    # 페이징 파라미터
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # 필터 파라미터
    status = request.args.get('status')  # pending/approved/rejected 또는 없음
    search = request.args.get('search')  # 제목/장소 검색
    
    # 페이지 유효성 검증
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 20
    
    try:
        # 기본 쿼리
        query = db.session.query(Event)
        
        # 상태 필터
        if status:
            try:
                status_enum = EventStatus(status)
                query = query.filter(Event.status == status_enum)
            except ValueError:
                return {
                    "error_code": "INVALID_STATUS",
                    "message": "유효하지 않은 상태값입니다."
                }, 400
        
        # 검색 필터 (제목 또는 장소)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (Event.title.like(search_pattern)) | 
                (Event.location.like(search_pattern))
            )
        
        # 정렬 (최신순)
        query = query.order_by(Event.created_at.desc())
        
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
            },
            "filters": {
                "status": status,
                "search": search
            }
        }, 200
        
    except Exception as e:
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "행사 목록 조회 중 오류가 발생했습니다."
        }, 500
