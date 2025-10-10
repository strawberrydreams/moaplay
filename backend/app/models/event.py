from . import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, ForeignKey, DateTime, Date, Enum, BigInteger, JSON
from datetime import datetime, date
from typing import Optional, List, TYPE_CHECKING
from .enums import EventStatus

if TYPE_CHECKING:
    from .user import User
    from .review import Review
    from .schedule import Schedule
    from .favorite import Favorite
    from .event_tag import EventTag

class Event(db.Model):
    __tablename__ = 'events'
    
    # 기본 필드 (타입 힌트 포함)
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # JSON 필드 (이미지 URL 배열)
    image_urls: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)
    
    # 외래키
    host_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    
    # 상태 관리
    status: Mapped[EventStatus] = mapped_column(Enum(EventStatus), default=EventStatus.PENDING)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text)
    
    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(), onupdate=lambda: datetime.now())
    
    # 관계 설정
    host: Mapped["User"] = relationship("User", back_populates="hosted_events")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="event", cascade="all, delete-orphan")
    schedules: Mapped[List["Schedule"]] = relationship("Schedule", back_populates="event", cascade="all, delete-orphan")
    favorites: Mapped[List["Favorite"]] = relationship("Favorite", back_populates="event", cascade="all, delete-orphan")
    tags: Mapped[List["EventTag"]] = relationship("EventTag", back_populates="event", cascade="all, delete-orphan")

    # !hashtag 추가 예정
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "summary": self.summary,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "location": self.location,
            "description": self.description,
            "phone": self.phone,
            "image_urls": self.image_urls,
            "host": {
                "id": self.host.id,
                "name": self.host.name
            },
            "status": self.status.value,
            "created_at": self.created_at,
        }