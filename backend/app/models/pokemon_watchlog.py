from sqlalchemy import Column, String, Integer, Boolean, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid

class PokemonWatchlog(Base):
    __tablename__ = "pokemon_watchlog"

    id=Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    season = Column(String, nullable=False)
    episode_number = Column(Integer, nullable=False)
    episode_title = Column(String, nullable=True)
    watched = Column(Boolean, default=False)
    watched_date = Column(Date, nullable=True)