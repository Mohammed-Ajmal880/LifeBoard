import uuid
from datetime import datetime
from typing import Optional
from .application_base import ApplicationBase
from .cv_version_out import CVVersionOut

class ApplicationOut(ApplicationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    updated_at: datetime
    cv_version: Optional[CVVersionOut] = None
    
    class Config:
        from_attributes = True