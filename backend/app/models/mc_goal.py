from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid
from datetime import datetime

class MCGoal(Base):
    __tablename__="mc_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey=("users.id"), nullable=False)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, default=datetime.now(datetime.timezone.utc))