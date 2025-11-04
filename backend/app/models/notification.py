from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import BigInteger, String, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from . import db
from .enums import NotificationType

if TYPE_CHECKING:
    from .user import User
    from .event import Event
    from .notification_recipient import NotificationRecipient


class Notification(db.Model):
    __tablename__ = 'notifications'

    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True)

    # Foreign Keys
    event_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey('events.id', ondelete='CASCADE'),
        nullable=False
    )
    sent_by: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False
    )

    # Notification Info
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[NotificationType] = mapped_column(
        SQLEnum(NotificationType),
        nullable=False
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        nullable=False
    )

    # Relationships
    event: Mapped["Event"] = relationship(
        "Event",
        back_populates="notifications"
    )
    sender: Mapped["User"] = relationship(
        "User",
        foreign_keys=[sent_by],
        back_populates="sent_notifications"
    )
    recipients: Mapped[List["NotificationRecipient"]] = relationship(
        "NotificationRecipient",
        back_populates="notification",
        cascade="all, delete-orphan"
    )

    def to_dict(self) -> dict:
        """딕셔너리 변환"""
        return {
            'id': self.id,
            'event_id': self.event_id,
            'title': self.title,
            'message': self.message,
            'type': self.type.value,
            'sender': {
                'id': self.sender.id,
                'nickname': self.sender.nickname
            },
            'created_at': self.created_at.isoformat() + 'Z'
        }

    def __repr__(self) -> str:
        return f'<Notification {self.id}: {self.title}>'