from . import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, BigInteger, DateTime, Integer, JSON, ForeignKey
from datetime import datetime
from typing import TYPE_CHECKING, Optional, List

if TYPE_CHECKING:
    from .user import User
    from .event import Event

class Review(db.Model):
    __tablename__ = 'reviews'
    
    # 기본 필드
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5점
    image_urls: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    
    # 외래키
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    event_id: Mapped[int] = mapped_column(ForeignKey('events.id'), nullable=False)
    
    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(), onupdate=lambda: datetime.now())
    
    # 관계 설정
    user: Mapped["User"] = relationship("User", back_populates="reviews")
    event: Mapped["Event"] = relationship("Event", back_populates="reviews")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "rating": self.rating,
            "image_urls": self.image_urls or [],
            "user": {
                "id": self.user.id,
                "nickname": self.user.nickname,
                "profile_image": self.user.profile_image
            },
            "event": {
                "id": self.event.id,
                "title": self.event.title
            },
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }