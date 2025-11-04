from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData

class Base(DeclarativeBase):
    metadata = MetaData(naming_convention={
        "ix": 'ix_%(column_0_label)s',
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s"
    })

db = SQLAlchemy(model_class=Base)

from app.models.user import User
from app.models.event import Event
from app.models.review import Review
from app.models.schedule import Schedule
from app.models.favorite import Favorite
from app.models.tag import Tag
from app.models.event_tag import EventTag
from app.models.user_tag import UserTag
from app.models.notification import Notification
from app.models.notification_recipient import NotificationRecipient