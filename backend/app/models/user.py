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

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    # 기본 필드
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    nickname: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    profile_image: Mapped[str] = mapped_column(String(500), nullable=True)
    
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

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_sensitive=False) -> dict:
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "nickname": self.nickname,
            "name": self.name,
            "profile_image": self.profile_image,
            "role": self.role.value
        }

        if include_sensitive == True:
            data["email"] = self.email
            data["phone"] = self.phone

        