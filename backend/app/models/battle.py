from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid
from datetime import datetime, timezone

class Battle(Base):
    __tablename__ = "battles"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id      = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    team1_id     = Column(UUID(as_uuid=True), ForeignKey("pokemon_teams.id", ondelete="CASCADE"), nullable=False)
    team2_id     = Column(UUID(as_uuid=True), ForeignKey("pokemon_teams.id", ondelete="CASCADE"), nullable=False)
    winner       = Column(String, nullable=True)
    created_at   = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class BattleTurn(Base):
    __tablename__ = "battle_turns"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    battle_id      = Column(UUID(as_uuid=True), ForeignKey("battles.id", ondelete="CASCADE"), nullable=False)
    turn_number    = Column(Integer, nullable=False)
    attacker_slot  = Column(Integer, nullable=False)
    move_name      = Column(String, nullable=False)
    move_power     = Column(Integer, nullable=True)
    damage_dealt   = Column(Integer, nullable=False)
    target_slot    = Column(Integer, nullable=False)
    is_player_turn = Column(String, nullable=False)