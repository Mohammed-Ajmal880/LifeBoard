from pydantic import BaseModel
import uuid
from datetime import datetime

class CVVersionOut(BaseModel):
    id: uuid.UUID
    label: str
    file_name: str
    type: str
    uploaded_at: datetime

    class Config:
        from_attributes = True