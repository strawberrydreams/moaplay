from flask import Blueprint, request, session
from ..models import db
from ..models.user import User, return_user_401

auth_bp = Blueprint("auth", __name__)

### 로그인 api
### PUT /api/auth/login
@auth_bp.route("/login", methods=["POST"])
def login():
    user_id = request.get_json().get("user_id")
    password = request.get_json().get("password")

    user = User.query.filter_by(user_id=user_id).first()
    if (not user) or (not user.check_password(password)):
        return {
            "error": "아이디 또는 비밀번호가 올바르지 않습니다.",
            "code": "INVALID_CREDENTIALS"
        }, 401
    
    session["id"] = user.id
    return{
        "id": user.id,
        "user_id": user.user_id
    }, 200

### 로그아웃 api
### PUT /api/auth/logout
# @loginRequired
@auth_bp.route("/logout", methods=["POST"])
def logout():
    if not "id" in session:
        return return_user_401()
    
    session.pop("id", None)

    return {"message": "로그아웃 되었습니다."}

@auth_bp.route("/login_test", methods=["GET"])
def login_test():
    if "id" in session:
        return {"id": session["id"]}
    else:
        return {"message": "로그인 되어있지 않습니다."}