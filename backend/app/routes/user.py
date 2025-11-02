from flask import Blueprint, request
from flask_login import current_user, login_required, logout_user
from ..models import db
from ..models.user import User
from ..models.user_tag import UserTag
from ..models.tag import Tag
import re
from datetime import datetime

user_bp = Blueprint('users', __name__)

### 회원가입 API
### POST /api/users/
@user_bp.route('/', methods=['POST'])
def create_user():
    data = request.get_json()
    # 필수 필드 검증
    required_fields = ['user_id', 'nickname', 'email', 'password']
    for field in required_fields:
        if not data.get(field):
            return {
                'error': f'{field} 필드는 필수입니다.',
                'code': 'MISSING_FIELD',
                'field': field
            }, 400
        
    user_id = data['user_id'].strip()
    nickname = data['nickname'].strip()
    email = data['email'].strip()
    password = data['password']

    phone = data.get("phone")
    profile_image = data.get("profile_image")

    #유효성 검사, 중복검사
    # user_id 형식 검증 (4-50자, 영문+숫자+언더스코어)
    if not re.match(r'^[a-zA-Z0-9_]{4,50}$', user_id):
        return {
            'error': '아이디는 4-50자의 영문, 숫자, 언더스코어만 허용됩니다.',
            'code': 'INVALID_USER_ID',
            'field': 'user_id'
        }, 400
    # nickname 길이 검증 (2-100자)
    if len(nickname) < 2 or len(nickname) > 100:
        return {
            'error': '닉네임은 2-100자여야 합니다.',
            'code': 'INVALID_NICKNAME',
            'field': 'nickname'
        }, 400
    # email 형식 검증
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return {
            'error': '유효한 이메일 형식이 아닙니다.',
            'code': 'INVALID_EMAIL',
            'field': 'email'
        }, 400
    # 비밀번호 길이 검증 (최소 8자)
    if len(password) < 8:
        return {
            'error': '비밀번호는 최소 8자 이상이어야 합니다.',
            'code': 'INVALID_PASSWORD',
            'field': 'password'
        }, 400
    
    if User.query.filter((User.user_id == user_id) | (User.nickname == nickname) | (User.email == email)).first():
        return {
            "error": "중복"
        }, 409
        
    
    user = User(user_id=user_id, nickname=nickname, email=email, phone=phone, profile_image=profile_image)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return user.to_dict(me=True), 201

### 내 정보 조회 API
### GET /api/users/me
@user_bp.route("/me", methods=["GET"])
@login_required
def get_me():
    return current_user.to_dict(me=True), 200

### 유저 정보 조회 API
### GET /api/users/<id>
@user_bp.route("/<int:id>", methods=["GET"])
def get_user(id):
    user: User = User.query.get(id)
    if user is None:
        return {
            "error_code": "USER_NOT_FOUND",
            "message": "사용자를 찾을 수 없습니다."
        }, 404

    return user.to_dict(), 200

### 내 정보 수정 API
### PUT /api/users/me
@user_bp.route('/me', methods=['PUT'])
@login_required
def update_me():
    data = request.get_json()
    
    try:
        # 수정 가능한 필드
        if 'nickname' in data:
            # 중복 확인 (자신 제외)
            existing = User.query.filter(
                User.nickname == data['nickname'],
                User.id != current_user.id
            ).first()
            if existing:
                return {
                    "error_code": "DUPLICATE_NICKNAME",
                    "message": "이미 사용 중인 닉네임입니다."
                }, 409
            current_user.nickname = data['nickname']
        
        if 'phone' in data:
            current_user.phone = data['phone']
        
        if 'profile_image' in data:
            current_user.profile_image = data['profile_image']
        
        # 선호 태그 수정
        if 'preferred_tags' in data:
            tag_names = data['preferred_tags']
            if not isinstance(tag_names, list):
                return {
                    "error_code": "INVALID_FORMAT",
                    "message": "preferred_tags는 배열이어야 합니다."
                }, 400
            
            # 기존 선호 태그 모두 삭제
            db.session.query(UserTag).filter_by(user_id=current_user.id).delete()  # 수정: UserPreferredTag → UserTag
            
            # 새 선호 태그 추가
            for tag_name in tag_names:
                # 태그 찾기 또는 생성
                tag = db.session.query(Tag).filter_by(name=tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.session.add(tag)
                    db.session.flush()
                
                # 선호 태그 관계 생성
                user_tag = UserTag(
                    user_id=current_user.id,
                    tag_id=tag.id
                )
                db.session.add(user_tag)
        
        current_user.updated_at = datetime.now()
        db.session.commit()
        
        return current_user.to_dict(me=True), 200
        
    except Exception as e:
        db.session.rollback()
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "정보 수정 중 오류가 발생했습니다."
        }, 500

### 비밀번호 변경 API
### PUT /api/users/me/password
@user_bp.route("/me/password", methods=["PUT"])
@login_required
def change_password():
    password = request.get_json().get("password")
    new_password = request.get_json().get("new_password")

    user = current_user

    if not user.check_password(password):
        return {
            "error_code": "INVALID_CURRENT_PASSWORD",
            "message": "현재 비밀번호가 일치하지 않습니다."
        }, 400
    if len(new_password) < 8:
        return {
            "error_code": "INVALID_PASSWORD_FORMAT",
            "message": "새 비밀번호는 8자 이상이어야 합니다."
        }, 422
    
    user.set_password(new_password)
    db.session.commit()

    return {"message": "비밀번호가 변경되었습니다."}, 200

### 회원 탈퇴 API
### DELETE /api/users/me
@user_bp.route("/me", methods=["DELETE"])
@login_required
def delete_user():
    user = current_user
    data = request.get_json()

    if not data.get("confirm"):
        return {
            "error_code": "CONFIRMATION_REQUIRED",
            "message": "회원 탈퇴 확인이 필요합니다."
        }, 400

    password = data.get("password")
    if not user.check_password(password=password):
        return {
            "error_code": "INVALID_PASSWORD",
            "message": "비밀번호가 일치하지 않습니다."
        }, 400
    
    db.session.delete(user)
    db.session.commit()

    logout_user()
    return {"message": "회원 탈퇴가 완료되었습니다."}, 200

### 회원가입 중복 확인 API
### GET /api/users/check
@user_bp.route("/check", methods=["GET"])
def check_availability():
    field_type = request.args.get("type")
    value = request.args.get("value")

    if field_type == "user_id":
        exists = User.query.filter_by(user_id=value).first() is not None
    elif field_type == "nickname":
        exists = User.query.filter_by(nickname=value).first() is not None
    elif field_type == "email":
        exists = User.query.filter_by(email=value).first() is not None
    else:
        return {
            "error": f" {field_type}은 올바른 type명이 아닙니다."
        }, 400
    
    return {
        "available": not exists,
        "message": f"이미 사용중인 {field_type}입니다." if exists else f"사용 가능한 {field_type} 입니다."
    }

### 선호 태그 추가 API
### POST /api/users/me/preferred-tags
@user_bp.route('/me/preferred-tags', methods=['POST'])
@login_required
def add_preferred_tag():
    data = request.get_json()
    
    if 'tag_name' not in data:
        return {
            "error_code": "MISSING_FIELDS",
            "message": "tag_name 필드가 필요합니다."
        }, 400
    
    tag_name = data['tag_name']
    
    try:
        # 태그 찾기 또는 생성
        tag = db.session.query(Tag).filter_by(name=tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.session.add(tag)
            db.session.flush()
        
        # 중복 확인
        existing = db.session.query(UserTag).filter_by(
            user_id=current_user.id,
            tag_id=tag.id
        ).first()
        
        if existing:
            return {
                "error_code": "DUPLICATE_TAG",
                "message": "이미 선호 태그에 추가되어 있습니다."
            }, 409
        
        # 선호 태그 추가
        user_tag = UserTag(
            user_id=current_user.id,
            tag_id=tag.id
        )
        db.session.add(user_tag)
        db.session.commit()
        
        return user_tag.to_dict(), 201
        
    except Exception as e:
        db.session.rollback()
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "선호 태그 추가 중 오류가 발생했습니다."
        }, 500


### 선호 태그 삭제 API
### DELETE /api/users/me/preferred-tags/{tag_id}
@user_bp.route('/me/preferred-tags/<int:tag_id>', methods=['DELETE'])
@login_required
def delete_preferred_tag(tag_id):
    user_tag = db.session.query(UserTag).filter_by(
        user_id=current_user.id,
        tag_id=tag_id
    ).first()
    
    if not user_tag:
        return {
            "error_code": "TAG_NOT_FOUND",
            "message": "선호 태그를 찾을 수 없습니다."
        }, 404
    
    try:
        db.session.delete(user_tag)
        db.session.commit()
        
        return {
            "message": "선호 태그가 삭제되었습니다."
        }, 200
        
    except Exception as e:
        db.session.rollback()
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "선호 태그 삭제 중 오류가 발생했습니다."
        }, 500