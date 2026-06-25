from pydantic import BaseModel
import uuid
from datetime import date, datetime
from typing import Optional

class ApplicationCreate(BaseModel):
    company: str
    role: str
    applied_date: date
    cv_version_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    cv_version_id: Optional[uuid.UUID] = None

class ApplicationOut(BaseModel):
    id: uuid.UUID
    company: str
    role: str
    status: str
    notes: Optional[str]
    applied_date: date
    updated_at: datetime
    cv_version_id: Optional[uuid.UUID]

    class Config:
        from_attributes = True