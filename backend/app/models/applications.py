from sqlalchemy import DateTime, Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid
from datetime import datetime

class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey=("users.id"), nullable=False )
    cv_version_id = Column(UUID(as_uuid=True), ForeignKey("cv_versions.id", ondelete="SET NULL"), nullable=True)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    status = Column(String, default="applied")
    notes = Column(String, nullable=True)
    applied_date = Column(Date, nullable=False)
    updated_at = Column(DateTime, default=datetime.now(datetime.timezone.utc))