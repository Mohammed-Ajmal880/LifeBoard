from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime
from typing import Optional

class MCSessionCreate(BaseModel):
    world_name: str
    session_date: date
    duration_minutes: int
    description: Optional[str] = None

class MCSessionUpdate(BaseModel):
    world_name: Optional[str] = None
    session_date: Optional[date] = None
    duration_minutes: Optional[int] = None
    description: Optional[str] = None

class MCSessionOut(BaseModel):
    id: UUID
    world_name: str
    session_date: date
    duration_minutes: int
    description: Optional[str] = None

    class Config:
        from_attributes = True

class MCGoalCreate(BaseModel):
    title: str

class MCGoalUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None

class MCGoalOut(BaseModel):
    id: UUID
    title: str
    completed: bool
    created_at: datetime

    class Config:
        from_attributes = True
