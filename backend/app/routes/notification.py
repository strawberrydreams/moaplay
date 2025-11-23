import json
import time
from queue import Queue, Empty
from typing import Dict

from flask import Blueprint, request, Response
from flask_login import login_required, current_user
from sqlalchemy import func

from app import db
from app.models.notification import Notification
from app.models.notification_recipient import NotificationRecipient
from app.models.event import Event
from app.models.schedule import Schedule
from app.models.enums import NotificationType, UserRole

noti_bp = Blueprint('notifications', __name__)

# 사용자별 알림 큐 (메모리 방식)
user_queues: Dict[int, Queue] = {}

# 사용자별 알림 큐 가져오기
def get_user_queue(user_id: int) -> Queue:
    if user_id not in user_queues:
        user_queues[user_id] = Queue()
    return user_queues[user_id]

# 사용자 큐에 알림 추가
def push_to_user_queue(user_id: int, notification_data: dict) -> None:
    queue = get_user_queue(user_id)
    queue.put(notification_data)


### 알림 발송 API
### POST /api/notifications/
@noti_bp.route('/', methods=['POST'])
@login_required
def send_notification():
    # 요청 데이터
    data = request.get_json()
    event_id = data.get('event_id')
    title = data.get('title')
    message = data.get('message')
    notification_type = data.get('type')
    
    # 필수 필드 검증
    if not all([event_id, title, message, notification_type]):
        return {
            'error_code': 'MISSING_FIELDS',
            'message': '모든 필드를 입력해주세요.'
        }, 400
    
    # 알림 타입 검증
    if notification_type not in ['info', 'warning', 'urgent']:
        return {
            'error_code': 'INVALID_REQUEST',
            'message': '알림 타입은 info, warning, urgent 중 하나여야 합니다.'
        }, 400
    
    # 행사 조회
    event = db.session.get(Event, event_id)
    if not event:
        return {'error_code': 'EVENT_NOT_FOUND', 'message': '행사를 찾을 수 없습니다.'}, 404
    
    # 권한 체크(Admin, Host)
    if current_user.role != UserRole.ADMIN:
        if event.host_id != current_user.id:
            return {
                'error_code': 'PERMISSION_DENIED',
                'message': '관리자와 본인이 주최한 행사에만 알림을 발송할 수 있습니다.'
            }, 403
    
    # 수신 대상 조회 (해당 행사를 일정에 추가한 사용자)
    recipients = db.session.query(Schedule.user_id)\
        .filter(Schedule.event_id == event_id)\
        .distinct()\
        .all()
    
    recipient_ids = [r[0] for r in recipients]
    
    if not recipient_ids:
        return {
            'error_code': 'NO_RECIPIENTS',
            'message': '일정에 등록한 사용자가 없어 알림을 발송할 수 없습니다.'
        }, 400
    
    try:
        # 알림 생성
        notification = Notification(
            event_id=event_id,
            title=title,
            message=message,
            type=NotificationType(notification_type),
            sent_by=current_user.id
        )
        db.session.add(notification)
        db.session.flush()  # ID 생성
        
        # 수신자 목록 생성
        for user_id in recipient_ids:
            recipient = NotificationRecipient(
                notification_id=notification.id,
                user_id=user_id
            )
            db.session.add(recipient)
        
        db.session.commit()
        
        # SSE로 실시간 푸시
        notification_data = notification.to_dict()
        for user_id in recipient_ids:
            push_to_user_queue(user_id, notification_data)
        
        # 응답
        return {
            'id': notification.id,
            'event_id': notification.event_id,
            'title': notification.title,
            'message': notification.message,
            'type': notification.type.value,
            'sender': {
                'id': notification.sender.id,
                'nickname': notification.sender.nickname
            },
            'recipients_count': len(recipient_ids),
            'created_at': notification.created_at.isoformat() + 'Z'
        }, 201
        
    except Exception as e:
        db.session.rollback()
        return {
            'error_code': 'INTERNAL_SERVER_ERROR',
            'message': '알림 발송 중 오류가 발생했습니다.'
        }, 500


### 내 알림 목록 조회 API
### GET /api/notifications/my
@noti_bp.route('/my', methods=['GET'])
@login_required
def get_my_notifications():
    # 쿼리 파라미터
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    is_read = request.args.get('is_read', type=str)
    
    # 기본 쿼리
    query = NotificationRecipient.query\
        .filter(NotificationRecipient.user_id == current_user.id)\
        .order_by(NotificationRecipient.created_at.desc())
    
    # 읽음/안읽음 필터
    if is_read == 'true':
        query = query.filter(NotificationRecipient.is_read == True)
    elif is_read == 'false':
        query = query.filter(NotificationRecipient.is_read == False)
    
    # 페이징
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # 안읽은 알림 개수
    unread_count = NotificationRecipient.query\
        .filter(NotificationRecipient.user_id == current_user.id)\
        .filter(NotificationRecipient.is_read == False)\
        .count()
    
    return {
        'notifications': [r.to_dict() for r in paginated.items],
        'unread_count': unread_count,
        'pagination': {
            'page': paginated.page,
            'per_page': paginated.per_page,
            'total': paginated.total,
            'pages': paginated.pages
        }
    }, 200


### SSE 스트림 API
### GET /api/notifications/stream
@noti_bp.route('/stream', methods=['GET'])
@login_required
def stream_notifications():
    def generate():
        """SSE 이벤트 생성"""
        queue = get_user_queue(current_user.id)
        last_heartbeat = time.time()
        
        while True:
            try:
                # 논블로킹으로 큐에서 알림 가져오기 (1초 타임아웃)
                notification = queue.get(timeout=1)
                yield f"data: {json.dumps(notification)}\n\n"
                
            except Empty:
                # 타임아웃 (알림 없음)
                pass
            
            # Heartbeat 전송 (30초마다)
            if time.time() - last_heartbeat > 30:
                yield ": heartbeat\n\n"
                last_heartbeat = time.time()
    
    return Response(
        generate(),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Connection': 'keep-alive'
        }
    )


### 읽은 알림 처리 API
### PUT /api/notifications/<recipient_id>/read
@noti_bp.route('/<int:recipient_id>/read', methods=['PUT'])
@login_required
def mark_notification_as_read(recipient_id: int):
    # 수신 알림 조회
    recipient = db.session.get(NotificationRecipient, recipient_id)
    if not recipient:
        return {
            'error_code': 'NOTIFICATION_NOT_FOUND',
            'message': '알림을 찾을 수 없습니다.'
        }, 404
    
    # 권한 체크: 본인이 받은 알림인가?
    if recipient.user_id != current_user.id:
        return {
            'error_code': 'PERMISSION_DENIED',
            'message': '본인의 알림만 읽음 처리할 수 있습니다.'
        }, 403
    
    # 읽음 처리
    recipient.mark_as_read()
    db.session.commit()
    
    return {'message': '알림을 읽음 처리했습니다.'}, 200


### 알림 삭제 API
### DELETE /api/notifications/<notification_id>
@noti_bp.route('/<int:notification_id>', methods=['DELETE'])
@login_required
def delete_notification(notification_id: int):
    # 알림 조회
    notification = db.session.get(Notification, notification_id)
    if not notification:
        return {
            'error_code': 'NOTIFICATION_NOT_FOUND',
            'message': '알림을 찾을 수 없습니다.'
        }, 404
    
    # 권한 체크: 본인이 발송한 알림인가?
    if notification.sent_by != current_user.id:
        return {
            'error_code': 'PERMISSION_DENIED',
            'message': '발송한 알림만 삭제할 수 있습니다.'
        }, 403
    
    # 삭제 (CASCADE로 recipients도 자동 삭제)
    db.session.delete(notification)
    db.session.commit()
    
    return {'message': '알림이 삭제되었습니다.'}, 200