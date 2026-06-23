from sqlalchemy import Column, String, Integer, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid

class MCSession(Base):
    __tablename__ = "mc_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    world_name = Column(String, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    description = Column(String, nullable=True)
    screenshot_path = Column(String, nullable=True)
    session_date = Column(Date, nullable=False)
    