import uuid
from datetime import datetime
from pydantic import BaseModel

class CVVersionOut(BaseModel):
    id: uuid.UUID
    label: str
    file_name: str
    file_path: str
    type: str
    uploaded_at: datetime

    class Config:
        from_attributes = True