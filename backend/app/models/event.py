from . import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, ForeignKey, DateTime, Date, Enum, Integer, JSON, Numeric
from datetime import datetime, date
from typing import Optional, List, TYPE_CHECKING
from .enums import EventStatus
from decimal import Decimal

if TYPE_CHECKING:
    from .user import User
    from .review import Review
    from .schedule import Schedule
    from .favorite import Favorite
    from .event_tag import EventTag
    from .notification import Notification

class Event(db.Model):
    __tablename__ = 'events'
    
    # 기본 필드 (타입 힌트 포함)
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    summary: Mapped[str] = mapped_column(String(200), nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    organizer: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    hosted_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # JSON 필드 (이미지 URL 배열)
    image_urls: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)
    
    # 외래키
    host_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    
    # 상태 관리
    status: Mapped[EventStatus] = mapped_column(Enum(EventStatus), default=EventStatus.PENDING)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text)
    # 평균 평점
    average_rating: Mapped[float] = mapped_column(Numeric(2,1), default=0.0)
    
    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(), onupdate=lambda: datetime.now())
    
    # 관계 설정
    host: Mapped["User"] = relationship("User", back_populates="hosted_events")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="event", cascade="all, delete-orphan")
    schedules: Mapped[List["Schedule"]] = relationship("Schedule", back_populates="event", cascade="all, delete-orphan")
    favorites: Mapped[List["Favorite"]] = relationship("Favorite", back_populates="event", cascade="all, delete-orphan")
    tags: Mapped[List["EventTag"]] = relationship("EventTag", back_populates="event", cascade="all, delete-orphan")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="event", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "summary": self.summary,
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat(),
            "location": self.location,
            "description": self.description,
            "phone": self.phone,
            "organizer": self.organizer,
            "hosted_by": self.hosted_by,
            "image_urls": self.image_urls or [],
            "host": {
                "id": self.host.id,
                "nickname": self.host.nickname
            },
            "status": self.status.value,
            "tags": [tag.tag.name for tag in self.tags] if self.tags else [],
            "stats": {
                "average_rating": float(self.average_rating),
                "total_reviews": len(self.reviews),
                "view_count": self.view_count,
                "favorites_count": len(self.favorites),
                "schedules_count": len(self.schedules)
            },
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }