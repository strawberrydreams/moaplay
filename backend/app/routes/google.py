# app/routes/google.py
from flask import Blueprint, jsonify, redirect, request, current_app
from flask_login import login_required, current_user
from app.services.google_calendar import (
    build_auth_url,
    exchange_code_and_save_refresh_token,
    fetch_events_for_user,
    create_event_for_user,
    delete_event_for_user,
)

google_bp = Blueprint("google", __name__)


# 1) 구글 계정 연동 시작
# GET /api/google/auth
@google_bp.route("/auth", methods=["GET"])
@login_required
def google_auth():
    url = build_auth_url()
    return redirect(url)


# 2) 구글 OAuth callback
# GOOGLE_REDIRECT_URI = http://localhost:5000/api/google/auth/callback  이런 식으로 맞춰야 함
@google_bp.route("/auth/callback", methods=["GET"])
@login_required
def google_auth_callback():
    code = request.args.get("code")
    if not code:
        return "code is missing", 400

    try:
        exchange_code_and_save_refresh_token(current_user, code)
    except Exception as e:
        current_app.logger.exception(e)
        return "Failed to link google account", 500

    # 프론트엔드로 다시 돌려보냄 (주소는 네 프론트에 맞게 수정)
    return redirect("http://localhost:5173/google-linked-success")


# 3) 이벤트 조회
# GET /api/google/events
@google_bp.route("/events", methods=["GET"])
@login_required
def list_google_events():
    try:
        events = fetch_events_for_user(current_user)
        return jsonify(events)
    except RuntimeError as e:
        return jsonify({"message": str(e)}), 401
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({"message": "Failed to fetch google events"}), 500


# 4) 이벤트 생성
# POST /api/google/events
@google_bp.route("/events", methods=["POST"])
@login_required
def create_google_event():
    data = request.get_json() or {}
    title = data.get("title")
    start = data.get("start")
    end = data.get("end")

    if not title or not start:
        return jsonify({"message": "title and start are required"}), 400

    try:
        event = create_event_for_user(current_user, title, start, end)
        return jsonify(event)
    except RuntimeError as e:
        return jsonify({"message": str(e)}), 401
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({"message": "Failed to create event"}), 500


# 5) 이벤트 삭제
# DELETE /api/google/events/<event_id>
@google_bp.route("/events/<event_id>", methods=["DELETE"])
@login_required
def delete_google_event(event_id):
    try:
        delete_event_for_user(current_user, event_id)
        return jsonify({"ok": True})
    except RuntimeError as e:
        return jsonify({"message": str(e)}), 401
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({"message": "Failed to delete event"}), 500

# 6) 구글 연동 확인
# GET /api/google/status
@google_bp.route("/status", methods=["GET"])
@login_required
def google_status():
    """
    현재 로그인한 사용자가 구글 캘린더 연동이 되어 있는지 여부를 반환.
    user.google_refresh_token 에 따라 판단.
    """
    try:
        # User 모델에 맞게 필드명 수정해줘.
        refresh_token = getattr(current_user, "google_refresh_token", None)
        connected = bool(refresh_token)
        return jsonify({"connected": connected})
    except Exception as e:
        current_app.logger.exception(e)
        # 상태 확인 실패 시 일단 연동 안 된 걸로 처리
        return jsonify({"connected": False}), 500