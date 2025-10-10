from enum import Enum

class UserRole(Enum):
    USER = "user"
    ADMIN = "admin"
    HOST = "host"

class EventStatus(Enum):
    PENDING = "pending"
    APPROVED = "approved" 
    REJECTED = "rejected"