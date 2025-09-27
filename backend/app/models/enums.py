from enum import Enum

class UserRole(Enum):
    USER = "user"
    ADMIN = "admin"

class EventStatus(Enum):
    PENDING = "pending"
    APPROVED = "approved" 
    MODIFIED = "modified"
    REJECTED = "rejected"