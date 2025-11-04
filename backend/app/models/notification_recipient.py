from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import BigInteger, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from . import db

if TYPE_CHECKING:
    from .user import User
    from .notification import Notification


class NotificationRecipient(db.Model):
    __tablename__ = 'notification_recipients'

    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True)

    # Foreign Keys
    notification_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey('notifications.id', ondelete='CASCADE'),
        nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False
    )

    # Read Status
    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    read_at: Mapped[Optional[datetime]] = mapped_column(
        nullable=True
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        nullable=False
    )

    # Relationships
    notification: Mapped["Notification"] = relationship(
        "Notification",
        back_populates="recipients"
    )
    user: Mapped["User"] = relationship(
        "User",
        back_populates="received_notifications"
    )

    # Constraints
    __table_args__ = (
        UniqueConstraint('notification_id', 'user_id', name='uq_notification_user'),
    )

    def to_dict(self) -> dict:
        """딕셔너리 변환"""
        return {
            'id': self.id,
            'notification': self.notification.to_dict(),
            'is_read': self.is_read,
            'read_at': self.read_at.isoformat() + 'Z' if self.read_at else None,
            'created_at': self.created_at.isoformat() + 'Z'
        }

    def mark_as_read(self) -> None:
        """읽음 처리"""
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()

    def __repr__(self) -> str:
        return f'<NotificationRecipient {self.id}: notification={self.notification_id} user={self.user_id}>'