from pydantic import BaseModel
import uuid
from datetime import date
from typing import Optional

class ApplicationBase(BaseModel):
    company: str
    role: str
    status: Optional[str] = "Applied"
    notes: Optional[str] = None
    applied_date: Optional[date] = None
    cv_version_id: Optional[uuid.UUID] = None