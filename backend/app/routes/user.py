from flask import Blueprint, request, session
from ..models import db
from ..models.user import User, return_user_401
import re

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

### 내 정보 가져오기 api
### GET /api/users/me
# @loginRequired
@user_bp.route("/me", methods=["GET"])
def get_me():
    if not "id" in session:
        return return_user_401()
    
    id = session.get("id")
    me: User = User.query.get(id)

    return me.to_dict(me=True), 200

### 유저 정보 가져오기 api
### GET /api/users/<id>
@user_bp.route("/<int:id>", methods=["GET"])
def get_user(id):
    user = User.query.get(id)
    if user is None:
        return {
            "error_code": "USER_NOT_FOUND",
            "message": "사용자를 찾을 수 없습니다."
        }, 404

    return user.to_dict(), 200

### 내 정보 수정 api
### PUT /api/users/me
# @loginRequired
@user_bp.route("/me", methods=["PUT"])
def edit_me():
    if not "id" in session:
        return return_user_401()
    
    user: User = User.query.get_or_404(session["id"])
    data = request.get_json()

    if "nickname" in data:
        nickname = data.get("nickname")
        if User.query.filter_by(nickname=nickname).first():
            return {
                "error_code": "DUPLICATE_NICKNAME",
                "message": "이미 사용 중인 닉네임입니다."
            }, 409
        if len(nickname) < 2 or len(nickname) > 100:
            return {
                "error_code": "VALIDATION_ERROR",
                "message": "입력값이 유효하지 않습니다.",
                'field': 'nickname'
        }, 422

        user.nickname = nickname
    elif "email" in data:
        email = data.get("email")
        if User.query.filter_by(email=email).first():
            return {
                "error_code": "DUPLICATE_EMAIL",
                "message": "이미 사용 중인 이메일입니다."
            }, 409
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return {
                "error_code": "VALIDATION_ERROR",
                "message": "입력값이 유효하지 않습니다.",
                'field': 'email'
            }, 422
        
        user.email = data.get("email")
    elif "phone" in data:
        user.phone = data.get("phone")
    elif "profile_image" in data:
        user.profile_image = data.get("profile_image")

    db.session.commit()

    return user.to_dict(me=True)

### 비밀번호 변경 api
### PUT /api/users/me/password
# @loginRequired
@user_bp.route("/me/password", methods=["PUT"])
def change_password():
    if not "id" in session:
        return return_user_401()

    password = request.get_json().get("password")
    new_password = request.get_json().get("new_password")

    user: User = User.query.get(session["id"])

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


### 회원 탈퇴 api
### DELETE /api/users/me
# @loginRequired
@user_bp.route("/me", methods=["DELETE"])
def delete_user():
    if not "id" in session:
        return return_user_401()
    user: User = User.query.get_or_404(session["id"])

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

    session.pop("id", None)
    return {"message": "회원 탈퇴가 완료되었습니다."}, 200

### 회원가입 중복 확인 API (user_id, nickname, email)
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