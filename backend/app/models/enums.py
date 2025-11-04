from enum import Enum

class UserRole(Enum):
    USER = "user"
    ADMIN = "admin"
    HOST = "host"

class EventStatus(Enum):
    PENDING = "pending"
    APPROVED = "approved" 
    REJECTED = "rejected"

class NotificationType(Enum):
    INFO = "info"        # 일반 정보
    WARNING = "warning"  # 주의 사항
    URGENT = "urgent"    # 긴급