# app/routes/tag.py
from flask import Blueprint, request
from flask_login import login_required
from app.models import db
from app.models.tag import Tag

tag_bp = Blueprint('tags', __name__)

### 태그 생성 API
### POST /api/tags
@tag_bp.route('/', methods=['POST'])
@login_required
def create_tag():
    data = request.get_json()
    
    # 필수 필드 검증
    if 'name' not in data:
        return {
            "error_code": "MISSING_FIELDS",
            "message": "name 필드가 필요합니다."
        }, 400
    
    tag_name = data['name'].strip()
    
    if not tag_name:
        return {
            "error_code": "INVALID_TAG_NAME",
            "message": "태그 이름은 비어있을 수 없습니다."
        }, 400
    
    # 중복 확인
    existing = db.session.query(Tag).filter_by(name=tag_name).first()
    if existing:
        return {
            "error_code": "DUPLICATE_TAG",
            "message": "이미 존재하는 태그입니다."
        }, 409
    
    try:
        # 태그 생성
        tag = Tag(name=tag_name)
        db.session.add(tag)
        db.session.commit()
        
        return tag.to_dict(), 201
        
    except Exception as e:
        db.session.rollback()
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "태그 생성 중 오류가 발생했습니다."
        }, 500

### 태그 목록 조회 API
### GET /api/tags
@tag_bp.route('/', methods=['GET'])
def get_tags():
    # 쿼리 파라미터
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search')  # 검색어
    sort = request.args.get('sort', 'name')  # name, created_at
    order = request.args.get('order', 'asc')  # asc, desc
    
    # 페이지 유효성 검증
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 20
    
    try:
        # 기본 쿼리
        query = db.session.query(Tag)
        
        # 검색 필터 (태그 이름으로 검색)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(Tag.name.like(search_pattern))
        
        # 정렬
        if sort == 'created_at':
            order_column = Tag.created_at
        else:
            # 이름순 (기본)
            order_column = Tag.name
        
        if order == 'desc':
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())
        
        # 페이징
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        tags = [tag.to_dict() for tag in pagination.items]
        
        return {
            "tags": tags,
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
            "message": "태그 목록 조회 중 오류가 발생했습니다."
        }, 500

### 태그 삭제 API
### DELETE /api/tags/{id}
@tag_bp.route('/<int:tag_id>', methods=['DELETE'])
@login_required
def delete_tag(tag_id):
    tag = db.session.get(Tag, tag_id)
    
    if not tag:
        return {
            "error_code": "TAG_NOT_FOUND",
            "message": "태그를 찾을 수 없습니다."
        }, 404
    
    try:
        db.session.delete(tag)
        db.session.commit()
        
        return {
            "message": "태그가 삭제되었습니다."
        }, 200
        
    except Exception as e:
        db.session.rollback()
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "태그 삭제 중 오류가 발생했습니다."
        }, 500