from . import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import  BigInteger, DateTime, ForeignKey
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .event import Event
    from .tag import Tag

class EventTag(db.Model):
    __tablename__ = 'event_tags'
    
    # 기본 필드
    id: Mapped[int] = mapped_column(primary_key=True)
    
    # 외래키
    event_id: Mapped[int] = mapped_column(ForeignKey('events.id'), nullable=False)
    tag_id: Mapped[int] = mapped_column(ForeignKey('tags.id'), nullable=False)
    
    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now())
    
    # 관계 설정
    event: Mapped["Event"] = relationship("Event", back_populates="tags")
    tag: Mapped["Tag"] = relationship("Tag", back_populates="events")