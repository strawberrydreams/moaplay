from . import db
from flask_login import UserMixin
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import BigInteger, String, DateTime, Enum
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from .enums import UserRole
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .event import Event
    from .review import Review
    from .schedule import Schedule
    from .favorite import Favorite
    from .user_tag import UserTag
    from .notification import Notification
    from .notification_recipient import NotificationRecipient

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    # 기본 필드
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    nickname: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    profile_image: Mapped[str] = mapped_column(String(500), nullable=True, default="http://localhost:5000/static/images/profiles/default_profile_image.jpg")
    google_refresh_token = db.Column(db.String(512), nullable=True)

    # 권한
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.USER)
    
    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(), onupdate=lambda: datetime.now())
    
    # 관계 설정
    hosted_events: Mapped[List["Event"]] = relationship("Event", back_populates="host", cascade="all, delete-orphan")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    schedules: Mapped[List["Schedule"]] = relationship("Schedule", back_populates="user", cascade="all, delete-orphan")
    favorites: Mapped[List["Favorite"]] = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    preferred_tags: Mapped[List["UserTag"]] = relationship("UserTag", back_populates="user", cascade="all, delete-orphan")
    sent_notifications: Mapped[List["Notification"]] = relationship("Notification", foreign_keys="Notification.sent_by", back_populates="sender")
    received_notifications: Mapped[List["NotificationRecipient"]] = relationship("NotificationRecipient", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not isinstance(password, str):
            return False
        return check_password_hash(self.password_hash, password)
    
    def get_preferred_tags(self) -> List[str]:
        # 선호 태그 이름 리스트 반환
        return [rel.tag.name for rel in self.preferred_tags if rel.tag]
    
    def to_dict(self, me=False, include_role=False) -> dict:
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "nickname": self.nickname,
            "profile_image": self.profile_image,
            "created_at": self.created_at,
            'preferred_tags': self.get_preferred_tags(),
            "statistics": {
                "events_count": len(self.hosted_events),
                "reviews": len(self.reviews)
            }
        }
        
        # 관리자나 본인일 때만 role 포함
        if include_role or me:
            data["role"] = self.role.value

        if me == True:
            data["email"] = self.email
            data["phone"] = self.phone
            data["updated_at"] = self.updated_at
            data["statistics"]["favorites"] = len(self.favorites)

        return data

# 미안증 유저 에러 처리
def return_user_401():
    return {

            "error_code": "AUTHENTICATION_REQUIRED",
            "message": "인증이 필요합니다."
        }, 401