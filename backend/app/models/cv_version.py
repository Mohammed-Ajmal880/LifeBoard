from sqlalchemy import DateTime, Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid
from datetime import datetime, timezone

class CVVersion(Base):
    __tablename__ = "cv_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    label = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.now(timezone.utc))