from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime
from typing import Optional

# Watch Log Schemas

class WatchLogCreate(BaseModel):
    season: str
    episode_number: int
    episode_title: Optional[str] = None
    watched: bool = False
    watched_date: Optional[date] = None

class WatchLogUpdate(BaseModel):
    episode_title: Optional[str] = None
    watched: Optional[bool] = None
    watched_date: Optional[date] = None

class WatchLogOut(BaseModel):
    id: UUID
    season: str
    episode_number: int
    episode_title: Optional[str]
    watched: bool
    watched_date: Optional[date]

    class Config:
        from_attributes = True

# Team Schemas

class TeamCreate(BaseModel):
    team_name: str

class TeamUpdate(BaseModel):
    team_name: str

class TeamOut(BaseModel):
    id: UUID
    team_name: str
    created_at: datetime

    class Config:
        from_attributes = True

# Team Member Schemas

class TeamMemberCreate(BaseModel):
    pokedex_number: int
    slot: int
    nickname: Optional[str] = None

class TeamMemberUpdate(BaseModel):
    pokedex_number: int
    nickname: Optional[str] = None

class TeamMemberOut(BaseModel):
    id: UUID
    team_id: UUID
    pokedex_number: int
    slot: int
    nickname: Optional[str]

    class Config:
        from_attributes = True