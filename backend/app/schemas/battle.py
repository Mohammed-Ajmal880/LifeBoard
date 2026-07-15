from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class BattleStart(BaseModel):
    team1_id: UUID
    team2_id: UUID
    goes_first: str = "team1"

class MoveSubmit(BaseModel):
    move_name:  str
    move_power: Optional[int] = None
    move_type:  str
    goes_first: str = "team1"
    submitted_by: str = "player"

class TurnResult(BaseModel):
    turn_number:       int
    player_move:       str
    player_damage:     int
    opponent_move:     str
    opponent_damage:   int
    player_hp:         dict
    opponent_hp:       dict
    fainted:           List[str]
    battle_over:       bool
    winner:            Optional[str] = None
    log:               List[str]

class BattleOut(BaseModel):
    id:         UUID
    team1_id:   UUID
    team2_id:   UUID
    winner:     Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True