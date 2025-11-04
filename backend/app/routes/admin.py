from flask import Blueprint, request
from flask_login import current_user, login_required
from sqlalchemy import func
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

# 관리자 권한 체크 데코레이터
def admin_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return {
                "error_code": "UNAUTHORIZED",
                "message": "로그인이 필요합니다."
            }, 401
        
        if current_user.role != UserRole.ADMIN:
            return {
                "error_code": "PERMISSION_DENIED",
                "message": "관리자 권한이 필요합니다."
            }, 403
        
        return f(*args, **kwargs)
    return decorated_function


### 관리자 대시보드 API
### GET /api/admin/dashboard
@admin_bp.route('/dashboard', methods=['GET'])
@login_required
@admin_required
def get_dashboard():
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


### 승인 대기 목록 API
### GET /api/admin/pending-list
@admin_bp.route('/pending-list', methods=['GET'])
@login_required
@admin_required
def get_pending_list():
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


### 승인 완료 목록 API
### GET /api/admin/approved-list
@admin_bp.route('/approved-list', methods=['GET'])
@login_required
@admin_required
def get_approved_list():
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


### 전체 행사 관리 API
### GET /api/admin/events-list
@admin_bp.route('/events-list', methods=['GET'])
@login_required
@admin_required
def get_events_list():
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
        
        
### 사용자 목록 조회 (페이징 + 필터)
### GET /api/admin/users?page=1&per_page=20&role=HOST&user_id=abc123
@admin_bp.route('/users', methods=['GET'])
@login_required
@admin_required
def get_users():
    try:
        # 파라미터
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        user_id = request.args.get('user_id', type=str)
        role = request.args.get('role', type=str)

        if page < 1:
            page = 1
        if per_page < 1 or per_page > 100:
            per_page = 20

        query = db.session.query(User)

        if user_id:
            query = query.filter(User.user_id.like(f"%{user_id}%"))

        if role:
            try:
                role_enum = UserRole(role)
                query = query.filter(User.role == role_enum)
            except ValueError:
                return {
                    "error_code": "INVALID_ROLE",
                    "message": "유효하지 않은 role 값입니다."
                }, 400

        query = query.order_by(User.created_at.desc())
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        users = [user.to_dict(include_role=True) for user in pagination.items]

        return {
            "users": users,
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total": pagination.total,
                "pages": pagination.pages,
            },
            "filters": {
                "user_id": user_id,
                "role": role,
            }
        }, 200

    except Exception as e:
        print(e)
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "사용자 목록 조회 중 오류가 발생했습니다."
        }, 500

        
### 사용자 Role 변경 API
### PUT /api/admin/users/<int:user_id>/role
@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@login_required
@admin_required
def update_user_role(user_id):
    try:
        data = request.get_json()
        new_role = data.get('role')

        if not new_role:
            return {
                "error_code": "MISSING_ROLE",
                "message": "변경할 role 값이 필요합니다."
            }, 400

        try:
            role_enum = UserRole(new_role)
        except ValueError:
            return {
                "error_code": "INVALID_ROLE",
                "message": "유효하지 않은 role 값입니다."
            }, 400

        user = db.session.get(User, user_id)
        if not user:
            return {
                "error_code": "USER_NOT_FOUND",
                "message": "해당 사용자를 찾을 수 없습니다."
            }, 404

        user.role = role_enum
        db.session.commit()

        return {
            "message": f"사용자 {user.id}의 역할이 '{new_role}'(으)로 변경되었습니다.",
            "user": user.to_dict()
        }, 200

    except Exception as e:
        db.session.rollback()
        print(e)
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "사용자 역할 변경 중 오류가 발생했습니다."
        }, 500
        
        
### 사용자 삭제 API
### DELETE /api/admin/users/<int:user_id>
@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_user(user_id):
    try:
        user = db.session.get(User, user_id)
        if not user:
            return {
                "error_code": "USER_NOT_FOUND",
                "message": "해당 사용자를 찾을 수 없습니다."
            }, 404

        db.session.delete(user)
        db.session.commit()

        return {
            "message": f"사용자 ID {user_id}가 성공적으로 삭제되었습니다."
        }, 200

    except Exception as e:
        db.session.rollback()
        print(e)
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "사용자 삭제 중 오류가 발생했습니다."
        }, 500