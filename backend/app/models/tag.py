from . import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, BigInteger, DateTime
from datetime import datetime
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from .event_tag import EventTag

class Tag(db.Model):
    __tablename__ = 'tags'
    
    # 기본 필드
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    
    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now())
    
    # 관계 설정
    events: Mapped[List["EventTag"]] = relationship("EventTag", back_populates="tag", cascade="all, delete-orphan")