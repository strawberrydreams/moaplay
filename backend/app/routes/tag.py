from flask import Blueprint, request, jsonify
from app import db
from app.models.tag import Tag
import re

tag_bp = Blueprint('tags', __name__)

@tag_bp.route('/', methods=['POST'])
def create_tag():
    """태그 생성"""
    try:
        data = request.get_json()
        
        # 필수 필드 검증
        if not data.get('name'):
            return jsonify({
                'error': 'name 필드는 필수입니다.',
                'code': 'MISSING_FIELD',
                'field': 'name'
            }), 400
        
        name = data['name'].strip()
        
        # 이름 길이 검증 (1-50자)
        if len(name) < 1 or len(name) > 50:
            return jsonify({
                'error': '태그명은 1-50자여야 합니다.',
                'code': 'INVALID_NAME',
                'field': 'name'
            }), 400
        
        # 허용된 문자만 사용 (한글, 영문, 숫자, 공백, 하이픈, 언더스코어)
        if not re.match(r'^[가-힣a-zA-Z0-9\s\-_]+$', name):
            return jsonify({
                'error': '태그명은 한글, 영문, 숫자, 공백, 하이픈(-), 언더스코어(_)만 허용됩니다.',
                'code': 'INVALID_CHARACTER',
                'field': 'name'
            }), 400
        
        # 기존 태그 확인
        existing_tag = Tag.query.filter_by(name=name).first()
        if existing_tag:
            # 이미 존재하는 태그면 기존 태그 반환
            return jsonify({
                'id': existing_tag.id,
                'name': existing_tag.name,
                'created_at': existing_tag.created_at.isoformat() + 'Z',
                'message': '이미 존재하는 태그입니다.'
            }), 200
        
        # 새 태그 생성
        new_tag = Tag(name=name)
        
        # 데이터베이스 저장
        db.session.add(new_tag)
        db.session.commit()
        
        # 응답 데이터 준비
        response_data = {
            'id': new_tag.id,
            'name': new_tag.name,
            'created_at': new_tag.created_at.isoformat() + 'Z'
        }
        
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': '서버 오류가 발생했습니다.',
            'code': 'INTERNAL_SERVER_ERROR'
        }), 500