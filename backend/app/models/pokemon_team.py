from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid
from datetime import datetime

class PokemonTeam(Base):
    __tablename__ = "pokemon_teams"

    id=Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_ud = Column(UUID(as_uuid=True), ForeignKey=("users.id"), nullable=False)
    team_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now(datetime.timezone.utc))

class TeamMember(Base):
    __tablename__ = "team_members"

    id=Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("pokemon_teams.id"), nullable=False)
    pokedex_number = Column(Integer, nullable=False)
    nickname = Column(String, nullable=True)
    slot = Column(Integer, nullable=False)
    