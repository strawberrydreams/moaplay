from . import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import BigInteger, DateTime, ForeignKey
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User
    from .event import Event

class Favorite(db.Model):
    __tablename__ = 'favorites'
    
    # 기본 필드
    id: Mapped[int] = mapped_column(primary_key=True)
    
    # 외래키
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    event_id: Mapped[int] = mapped_column(ForeignKey('events.id'), nullable=False)
    
    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now())
    
    # 관계 설정
    user: Mapped["User"] = relationship("User", back_populates="favorites")
    event: Mapped["Event"] = relationship("Event", back_populates="favorites")

    def to_dict(self) -> dict:
        
        return {
            "id": self.id,
            "user": {
                "id": self.user.id,
                "nickname": self.user.nickname,
                "profile_image": self.user.profile_image
            },
            "event": {
                "id": self.event.id,
                "title": self.event.title,
                "summary": self.event.summary,
                "start_date": self.event.start_date.isoformat(),
                "end_date": self.event.end_date.isoformat(),
                "location": self.event.location,
                "image_urls": self.event.image_urls or [],
                "status": self.event.status.value,
                "average_rating": float(self.event.average_rating)
            },
            "created_at": self.created_at.isoformat()
        }