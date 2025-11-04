from flask import Blueprint, request
from flask_login import current_user, login_required
from app.models import db
from app.models.favorite import Favorite
from app.models.event import Event
from app.models.user import User
from app.models.enums import EventStatus

favorite_bp = Blueprint('favorites', __name__)

### 찜 추가 API
### POST /api/favorites
@favorite_bp.route('/', methods=['POST'])
@login_required
def create_favorite():
    data = request.get_json()
    
    # 필수 필드 검증
    if 'event_id' not in data:
        return {
            "error_code": "MISSING_FIELDS",
            "message": "event_id 필드가 필요합니다."
        }, 400
    
    event_id = data['event_id']
    user_id = current_user.id
    
    # 행사 존재 확인
    event = db.session.get(Event, event_id)
    if not event:
        return {
            "error_code": "EVENT_NOT_FOUND",
            "message": "행사를 찾을 수 없습니다."
        }, 404
    
    # approved 행사만 찜 추가 가능
    if event.status != EventStatus.APPROVED:
        return {
            "error_code": "EVENT_NOT_APPROVED",
            "message": "승인된 행사만 찜할 수 있습니다."
        }, 403
    
    # 중복 등록 확인
    existing = db.session.query(Favorite).filter_by(
        user_id=user_id,
        event_id=event_id
    ).first()
    
    if existing:
        return {
            "error_code": "DUPLICATE_FAVORITE",
            "message": "이미 찜한 행사입니다."
        }, 409
    
    try:
        # 찜 생성
        favorite = Favorite(
            user_id=user_id,
            event_id=event_id
        )
        
        db.session.add(favorite)
        db.session.commit()
        
        return favorite.to_dict(), 201
        
    except Exception as e:
        db.session.rollback()
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "찜 추가 중 오류가 발생했습니다."
        }, 500


### 찜 목록 조회 API
### GET /api/favorites
@favorite_bp.route('/', methods=['GET'])
@login_required
def get_favorites():
    user_id = current_user.id
    
    # 페이징 파라미터 (선택적)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # 페이지 유효성 검증
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 20
    
    try:
        # 본인의 찜 목록 조회 (최신순)
        query = db.session.query(Favorite).filter_by(user_id=user_id).order_by(Favorite.created_at.desc())
        
        # 페이징
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        favorites = [favorite.to_dict() for favorite in pagination.items]
        
        return {
            "favorites": favorites,
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
            "message": "찜 목록 조회 중 오류가 발생했습니다."
        }, 500


### 찜 단일 조회 API
### GET /api/favorites/event/<int:event_id>

@favorite_bp.route('/event/<int:event_id>', methods=['GET'])
@login_required
def get_favorite_by_event(event_id):
    """
    현재 로그인한 사용자가 특정 행사(event_id)를 찜했는지 확인합니다.
    """
    user_id = current_user.id

    try:
        favorite = (
            db.session.query(Favorite)
            .filter_by(user_id=user_id, event_id=event_id)
            .first()
        )

        if favorite:
            return {
                "is_favorited": True,
                "favorite": favorite.to_dict()
            }, 200
        else:
            return {
                "is_favorited": False,
                "message": "이 행사는 찜 목록에 없습니다."
            }, 200

    except Exception as e:
        print(f"[ERROR][get_favorite_by_event] {e}")
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "찜 상태 조회 중 오류가 발생했습니다."
        }, 500


### 찜 삭제 API
### DELETE /api/favorites/<id>
@favorite_bp.route('/<int:favorite_id>', methods=['DELETE'])
@login_required
def delete_favorite(favorite_id):
    favorite = db.session.get(Favorite, favorite_id)
    
    if not favorite:
        return {
            "error_code": "FAVORITE_NOT_FOUND",
            "message": "찜을 찾을 수 없습니다."
        }, 404
    
    # 본인의 찜인지 확인
    if favorite.user_id != current_user.id:
        return {
            "error_code": "PERMISSION_DENIED",
            "message": "본인의 찜만 삭제할 수 있습니다."
        }, 403
    
    try:
        db.session.delete(favorite)
        db.session.commit()
        
        return {
            "message": "찜이 삭제되었습니다."
        }, 200
        
    except Exception as e:
        db.session.rollback()
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "찜 삭제 중 오류가 발생했습니다."
        }, 500