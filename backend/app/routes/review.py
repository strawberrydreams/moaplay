from flask import Blueprint, request, session
from sqlalchemy import and_
from app.models import db
from app.models.review import Review
from app.models.event import Event
from app.models.user import User
from app.models.enums import EventStatus, UserRole
from datetime import datetime
from decimal import Decimal

review_bp = Blueprint('reviews', __name__)

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


def update_event_rating(event_id):
    """행사의 평균 평점 업데이트"""
    reviews = db.session.query(Review).filter_by(event_id=event_id).all()
    
    if not reviews:
        event = db.session.get(Event, event_id)
        event.average_rating = Decimal('0.0')
    else:
        total_rating = sum(review.rating for review in reviews)
        average = total_rating / len(reviews)
        event = db.session.get(Event, event_id)
        event.average_rating = round(Decimal(str(average)), 1)
    
    db.session.commit()


# ==================== 1. GET /api/reviews - 리뷰 목록 조회 ====================

@review_bp.route('/', methods=['GET'])
def get_reviews():
    """리뷰 목록 조회 (이벤트별, 페이징 지원)"""
    # 쿼리 파라미터
    event_id = request.args.get('event_id', type=int)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # event_id 필수
    if not event_id:
        return {
            "error_code": "MISSING_EVENT_ID",
            "message": "event_id 파라미터가 필요합니다."
        }, 400
    
    # 행사 존재 확인
    event = db.session.get(Event, event_id)
    if not event:
        return {
            "error_code": "EVENT_NOT_FOUND",
            "message": "행사를 찾을 수 없습니다."
        }, 404
    
    # 페이지 유효성 검증
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 10
    
    # 리뷰 조회 (최신순)
    query = db.session.query(Review).filter_by(event_id=event_id).order_by(Review.created_at.desc())
    
    # 페이징
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    reviews = [review.to_dict() for review in pagination.items]
    
    return {
        "reviews": reviews,
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages
        }
    }, 200


# ==================== 2. POST /api/reviews - 리뷰 작성 ====================

@review_bp.route('/', methods=['POST'])
@login_required
def create_review():
    """리뷰 작성 (로그인 사용자만 가능)"""
    data = request.get_json()
    
    # 필수 필드 검증
    required_fields = ['event_id', 'title', 'content', 'rating']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return {
            "error_code": "MISSING_FIELDS",
            "message": f"필수 필드가 누락되었습니다: {', '.join(missing_fields)}"
        }, 400
    
    # 평점 유효성 검증 (1-5)
    rating = data.get('rating')
    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return {
            "error_code": "INVALID_RATING",
            "message": "평점은 1에서 5 사이의 정수여야 합니다."
        }, 400
    
    # 행사 존재 확인
    event = db.session.get(Event, data['event_id'])
    if not event:
        return {
            "error_code": "EVENT_NOT_FOUND",
            "message": "행사를 찾을 수 없습니다."
        }, 404
    
    # approved 행사만 리뷰 작성 가능
    if event.status != EventStatus.APPROVED:
        return {
            "error_code": "EVENT_NOT_APPROVED",
            "message": "승인된 행사에만 리뷰를 작성할 수 있습니다."
        }, 403
    
    try:
        # 리뷰 생성
        review = Review(
            title=data['title'],
            content=data['content'],
            rating=data['rating'],
            image_urls=data.get('image_urls', []),
            user_id=session['id'],
            event_id=data['event_id']
        )
        
        db.session.add(review)
        db.session.commit()
        
        # 행사 평균 평점 업데이트
        update_event_rating(data['event_id'])
        
        return review.to_dict(), 201
        
    except Exception as e:
        db.session.rollback()
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "리뷰 작성 중 오류가 발생했습니다."
        }, 500


# ==================== 3. GET /api/reviews/{id} - 리뷰 상세 조회 ====================

@review_bp.route('/<int:review_id>', methods=['GET'])
def get_review(review_id):
    """리뷰 상세 조회"""
    review = db.session.get(Review, review_id)
    
    if not review:
        return {
            "error_code": "REVIEW_NOT_FOUND",
            "message": "리뷰를 찾을 수 없습니다."
        }, 404
    
    return review.to_dict(), 200


# ==================== 4. PUT /api/reviews/{id} - 리뷰 수정 ====================

@review_bp.route('/<int:review_id>', methods=['PUT'])
@login_required
def update_review(review_id):
    """리뷰 수정 (작성자만 가능)"""
    review = db.session.get(Review, review_id)
    
    if not review:
        return {
            "error_code": "REVIEW_NOT_FOUND",
            "message": "리뷰를 찾을 수 없습니다."
        }, 404
    
    user = get_current_user()
    
    # 작성자 확인
    if review.user_id != user.id:
        return {
            "error_code": "PERMISSION_DENIED",
            "message": "리뷰를 수정할 권한이 없습니다."
        }, 403
    
    data = request.get_json()
    
    try:
        # 수정 가능한 필드 업데이트
        if 'title' in data:
            review.title = data['title']
        if 'content' in data:
            review.content = data['content']
        if 'rating' in data:
            rating = data['rating']
            # 평점 유효성 검증
            if not isinstance(rating, int) or rating < 1 or rating > 5:
                return {
                    "error_code": "INVALID_RATING",
                    "message": "평점은 1에서 5 사이의 정수여야 합니다."
                }, 400
            review.rating = rating
        if 'image_urls' in data:
            review.image_urls = data['image_urls']
        
        review.updated_at = datetime.now()
        db.session.commit()
        
        # 평점이 변경된 경우 행사 평균 평점 업데이트
        if 'rating' in data:
            update_event_rating(review.event_id)
        
        return review.to_dict(), 200
        
    except Exception as e:
        db.session.rollback()
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "리뷰 수정 중 오류가 발생했습니다."
        }, 500


# ==================== 5. DELETE /api/reviews/{id} - 리뷰 삭제 ====================

@review_bp.route('/<int:review_id>', methods=['DELETE'])
@login_required
def delete_review(review_id):
    """리뷰 삭제 (작성자 + 관리자만 가능)"""
    review = db.session.get(Review, review_id)
    
    if not review:
        return {
            "error_code": "REVIEW_NOT_FOUND",
            "message": "리뷰를 찾을 수 없습니다."
        }, 404
    
    user = get_current_user()
    
    # 권한 체크 (작성자 또는 관리자)
    if review.user_id != user.id and user.role != UserRole.ADMIN:
        return {
            "error_code": "PERMISSION_DENIED",
            "message": "리뷰를 삭제할 권한이 없습니다."
        }, 403
    
    event_id = review.event_id
    
    try:
        db.session.delete(review)
        db.session.commit()
        
        # 행사 평균 평점 업데이트
        update_event_rating(event_id)
        
        return {
            "message": "리뷰가 삭제되었습니다."
        }, 200
        
    except Exception as e:
        db.session.rollback()
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "리뷰 삭제 중 오류가 발생했습니다."
        }, 500
