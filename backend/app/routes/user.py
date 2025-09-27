from flask import Blueprint, request
from ..models import db
from ..models.user import User
import re

user_bp = Blueprint('users', __name__)

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
        
    
    user = User(user_id=user_id, nickname=nickname, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return {
        "id": user.id,
        "user_id": user.user_id,
        "nickname": user.nickname,
        "email": user.email,
        "role": user.role.value,
        "created_at": user.created_at
    }, 201