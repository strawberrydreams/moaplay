# app/models/user_preferred_tag.py
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from . import db
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User
    from .tag import Tag

class UserTag(db.Model):
    __tablename__ = 'user_tags'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    tag_id: Mapped[int] = mapped_column(ForeignKey('tags.id', ondelete='CASCADE'), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="preferred_tags")
    tag: Mapped["Tag"] = relationship("Tag", back_populates="preferring_users")
    
    # 중복 방지
    __table_args__ = (
        UniqueConstraint('user_id', 'tag_id', name='uq_user_tag'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'tag': self.tag.to_dict() if self.tag else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }