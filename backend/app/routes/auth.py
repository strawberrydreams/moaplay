from flask import Blueprint, request
from flask_login import login_user, logout_user, current_user, login_required
from ..models import db
from ..models.user import User

auth_bp = Blueprint("auth", __name__)

### 로그인 API
### POST /api/auth/login
@auth_bp.route("/login", methods=["POST"])
def login():
    user_id = request.get_json().get("user_id")
    password = request.get_json().get("password")

    user: User = User.query.filter_by(user_id=user_id).first()
    if (not user) or (not user.check_password(password)):
        return {
            "error": "아이디 또는 비밀번호가 올바르지 않습니다.",
            "code": "INVALID_CREDENTIALS"
        }, 401
    
    login_user(user, remember=True)
    return {
        "id": user.id,
        "user_id": user.user_id
    }, 200

### 로그아웃 API
### POST /api/auth/logout
@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return {"message": "로그아웃 되었습니다."}

### 로그인 테스트 API
### GET /api/auth/login_test
@auth_bp.route("/login_test", methods=["GET"])
def login_test():
    if current_user.is_authenticated:
        return {"id": current_user.id}
    else:
        return {"message": "로그인 되어있지 않습니다."}