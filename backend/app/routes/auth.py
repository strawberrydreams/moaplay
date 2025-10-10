from flask import Blueprint, request, session
from ..models import db
from ..models.user import User

auth_bp = Blueprint("auth", __name__)

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

@auth_bp.route("/login_test", methods=["GET"])
def login_test():
    if "id" in session:
        return {"id": session["id"]}
    
# 회원가입 중복 확인 API (user_id, nickname, email)
# GET /api/auth/check-availability
@auth_bp.route("/check-availability", methods=["GET"])
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