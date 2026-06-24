import uuid
from datetime import date
from pydantic import BaseModel
from typing import Optional


class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    applied_date: Optional[date] = None
    cv_version_id: Optional[uuid.UUID] = None