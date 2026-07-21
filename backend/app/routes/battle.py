from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func
from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.battle import Battle, BattleTurn
from app.models.pokemon_team import PokemonTeam, TeamMember
from app.schemas.battle import BattleStart, MoveSubmit, BattleOut
from typing import List
from uuid import UUID
import random
import math
import httpx
import asyncio

router = APIRouter(prefix="/battles", tags=["Battles"])

LEVEL = 50

# Type effectiveness chart
TYPE_CHART = {
    ("normal",   "rock"):    0.5, ("normal",   "ghost"):   0,
    ("normal",   "steel"):   0.5,
    ("fire",     "fire"):    0.5, ("fire",     "water"):   0.5,
    ("fire",     "grass"):   2,   ("fire",     "ice"):     2,
    ("fire",     "bug"):     2,   ("fire",     "rock"):    0.5,
    ("fire",     "dragon"):  0.5, ("fire",     "steel"):   2,
    ("water",    "fire"):    2,   ("water",    "water"):   0.5,
    ("water",    "grass"):   0.5, ("water",    "ground"):  2,
    ("water",    "rock"):    2,   ("water",    "dragon"):  0.5,
    ("electric", "water"):   2,   ("electric", "electric"):0.5,
    ("electric", "grass"):   0.5, ("electric", "ground"):  0,
    ("electric", "flying"):  2,   ("electric", "dragon"):  0.5,
    ("grass",    "fire"):    0.5, ("grass",    "water"):   2,
    ("grass",    "grass"):   0.5, ("grass",    "poison"):  0.5,
    ("grass",    "ground"):  2,   ("grass",    "flying"):  0.5,
    ("grass",    "bug"):     0.5, ("grass",    "rock"):    2,
    ("grass",    "dragon"):  0.5, ("grass",    "steel"):   0.5,
    ("ice",      "water"):   0.5, ("ice",      "grass"):   2,
    ("ice",      "ice"):     0.5, ("ice",      "ground"):  2,
    ("ice",      "flying"):  2,   ("ice",      "dragon"):  2,
    ("ice",      "steel"):   0.5,
    ("fighting", "normal"):  2,   ("fighting", "ice"):     2,
    ("fighting", "poison"):  0.5, ("fighting", "flying"):  0.5,
    ("fighting", "psychic"): 0.5, ("fighting", "bug"):     0.5,
    ("fighting", "rock"):    2,   ("fighting", "ghost"):   0,
    ("fighting", "dark"):    2,   ("fighting", "steel"):   2,
    ("fighting", "fairy"):   0.5,
    ("poison",   "grass"):   2,   ("poison",   "poison"):  0.5,
    ("poison",   "ground"):  0.5, ("poison",   "rock"):    0.5,
    ("poison",   "ghost"):   0.5, ("poison",   "steel"):   0,
    ("poison",   "fairy"):   2,
    ("ground",   "fire"):    2,   ("ground",   "electric"): 2,
    ("ground",   "grass"):   0.5, ("ground",   "poison"):  2,
    ("ground",   "flying"):  0,   ("ground",   "bug"):     0.5,
    ("ground",   "rock"):    2,   ("ground",   "steel"):   2,
    ("flying",   "electric"): 0.5,("flying",   "grass"):   2,
    ("flying",   "fighting"): 2,  ("flying",   "bug"):     2,
    ("flying",   "rock"):    0.5, ("flying",   "steel"):   0.5,
    ("psychic",  "fighting"): 2,  ("psychic",  "poison"):  2,
    ("psychic",  "psychic"): 0.5, ("psychic",  "dark"):    0,
    ("psychic",  "steel"):   0.5,
    ("bug",      "fire"):    0.5, ("bug",      "grass"):   2,
    ("bug",      "fighting"): 0.5,("bug",      "flying"):  0.5,
    ("bug",      "psychic"): 2,   ("bug",      "ghost"):   0.5,
    ("bug",      "dark"):    2,   ("bug",      "steel"):   0.5,
    ("bug",      "fairy"):   0.5,
    ("rock",     "fire"):    2,   ("rock",     "ice"):     2,
    ("rock",     "fighting"): 0.5,("rock",     "ground"):  0.5,
    ("rock",     "flying"):  2,   ("rock",     "bug"):     2,
    ("rock",     "steel"):   0.5,
    ("ghost",    "normal"):  0,   ("ghost",    "psychic"): 2,
    ("ghost",    "ghost"):   2,   ("ghost",    "dark"):    0.5,
    ("dragon",   "dragon"):  2,   ("dragon",   "steel"):   0.5,
    ("dragon",   "fairy"):   0,
    ("dark",     "fighting"): 0.5,("dark",     "psychic"): 2,
    ("dark",     "ghost"):   2,   ("dark",     "dark"):    0.5,
    ("dark",     "fairy"):   0.5,
    ("steel",    "fire"):    0.5, ("steel",    "water"):   0.5,
    ("steel",    "electric"): 0.5,("steel",    "ice"):     2,
    ("steel",    "rock"):    2,   ("steel",    "steel"):   0.5,
    ("steel",    "fairy"):   2,
    ("fairy",    "fighting"): 2,  ("fairy",    "poison"):  0.5,
    ("fairy",    "bug"):     1,   ("fairy",    "dragon"):  2,
    ("fairy",    "dark"):    2,   ("fairy",    "steel"):   0.5,
}

def get_effectiveness(move_type: str, defender_type: str) -> float:
    return TYPE_CHART.get((move_type, defender_type), 1.0)

def calculate_damage(
    move_power:   int,
    move_type:    str,
    attacker_atk: int,
    defender_def: int,
    defender_type: str,
) -> int:
    if move_power == 0:
        return 0
    effectiveness = get_effectiveness(move_type, defender_type)
    crit          = 1.5 if random.random() < 0.0625 else 1.0
    rand_factor   = random.uniform(0.85, 1.0)
    raw = (
        ((2 * LEVEL / 5 + 2) * move_power * (attacker_atk / defender_def)) / 50 + 2
    ) * effectiveness * crit * rand_factor
    return max(1, math.floor(raw))

async def fetch_pokemon_data(pokedex_number: int) -> dict:
    async with httpx.AsyncClient() as client:
        res  = await client.get(f"https://pokeapi.co/api/v2/pokemon/{pokedex_number}")
        data = res.json()
        
        poke_type = data["types"][0]["type"]["name"]
        stats     = {s["stat"]["name"]: s["base_stat"] for s in data["stats"]}
        
        all_moves = data.get("moves", [])
        
        # 1. Pick a random pool of candidate moves instead of just the first 4
        candidate_moves = random.sample(all_moves, min(12, len(all_moves))) if all_moves else []

        # Helper function to fetch individual move data
        async def fetch_move_details(m):
            move_name = m["move"]["name"]
            m_res = await client.get(f"https://pokeapi.co/api/v2/move/{move_name}")
            m_data = m_res.json()
            return {
                "name":  move_name,
                "power": m_data.get("power") or 40,
                "type":  m_data["type"]["name"],
            }

        # 2. Fetch move details concurrently in parallel (Lightning Fast!)
        fetched_moves = await asyncio.gather(*[fetch_move_details(m) for m in candidate_moves])

        # 3. Prioritize STAB (moves matching the Pokemon's primary type)
        stab_moves  = [m for m in fetched_moves if m["type"] == poke_type]
        other_moves = [m for m in fetched_moves if m["type"] != poke_type]

        # Combine matching type moves first, then fill remaining slots up to 4
        final_moves = (stab_moves + other_moves)[:4]

        return {
            "name":        data["name"],
            "type":        poke_type,
            "hp":          stats.get("hp", 45),
            "attack":      stats.get("attack", 45),
            "defense":     stats.get("defense", 45),
            "moves":       final_moves,
            "sprite":      data["sprites"]["front_default"],
            "back_sprite": data["sprites"]["back_default"],
        }

# In-memory battle state store
battle_states = {}

@router.post("/start")
async def start_battle(
    data:         BattleStart,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    # Validate both teams belong to user
    team1 = db.query(PokemonTeam).filter(
        PokemonTeam.id      == data.team1_id,
        PokemonTeam.user_id == current_user.id
    ).first()
    team2 = db.query(PokemonTeam).filter(
        PokemonTeam.id      == data.team2_id,
        PokemonTeam.user_id == current_user.id
    ).first()

    if not team1 or not team2:
        raise HTTPException(status_code=404, detail="Team not found")

    if data.team1_id == data.team2_id:
        raise HTTPException(status_code=400, detail="Cannot battle a team against itself")

    # Get members for both teams
    team1_members = db.query(TeamMember).filter(
        TeamMember.team_id == data.team1_id
    ).order_by(TeamMember.slot).all()
    team2_members = db.query(TeamMember).filter(
        TeamMember.team_id == data.team2_id
    ).order_by(TeamMember.slot).all()

    if len(team1_members) < 3 or len(team2_members) < 3:
        raise HTTPException(
            status_code=400,
            detail="Both teams must have at least 3 members"
        )

    # Fetch PokéAPI data for all members concurrently
    team1_data = await asyncio.gather(
        *[fetch_pokemon_data(m.pokedex_number) for m in team1_members]
    )
    team2_data = await asyncio.gather(
        *[fetch_pokemon_data(m.pokedex_number) for m in team2_members]
    )

    p1_lead = team1_data[0]["name"].capitalize()
    p2_lead = team2_data[0]["name"].capitalize()

    initial_log = [
        f"Battle started between {team1.team_name} and {team2.team_name}!",
        f"Go! {p1_lead}!",
        f"{team2.team_name} sent out {p2_lead}!"
    ]

    # Build battle state
    def build_roster(members, poke_data):
        return [
            {
                "slot":       members[i].slot,
                "name":       poke_data[i]["name"],
                "type":       poke_data[i]["type"],
                "max_hp":     poke_data[i]["hp"],
                "current_hp": poke_data[i]["hp"],
                "attack":     poke_data[i]["attack"],
                "defense":    poke_data[i]["defense"],
                "moves":      poke_data[i]["moves"],
                "sprite":     poke_data[i]["sprite"],
                "back_sprite": poke_data[i]["back_sprite"],
                "fainted":    False,
            }
            for i in range(len(members))
        ]

    # Create battle record in DB
    battle = Battle(
        user_id  = current_user.id,
        team1_id = data.team1_id,
        team2_id = data.team2_id,
    )
    db.add(battle)
    db.commit()
    db.refresh(battle)

    # Store battle state in memory
    battle_states[str(battle.id)] = {
        "battle_id":          str(battle.id),
        "team1":              build_roster(team1_members, team1_data),
        "team2":              build_roster(team2_members, team2_data),
        "active1":            0,
        "active2":            0,
        "turn_number":        1,
        "battle_over":        False,
        "winner":             None,
        "goes_first":         data.goes_first,
        "team1_name":         team1.team_name,
        "team2_name":         team2.team_name,
        "log": initial_log,
    }

    return battle_states[str(battle.id)]

def _log_turn_to_db(
    battle_id: UUID,
    turn_number: int,
    attacker_slot: int,
    move_name: str,
    move_power: int,
    damage_dealt: int,
    target_slot: int,
    is_player: bool,
    db: Session
):
    turn_record = BattleTurn(
        battle_id=battle_id,
        turn_number=turn_number,
        attacker_slot=attacker_slot,
        move_name=move_name,
        move_power=move_power,
        damage_dealt=damage_dealt,
        target_slot=target_slot,
        is_player_turn="true" if is_player else "false"
    )
    db.add(turn_record)
    db.commit()


@router.post("/{battle_id}/move")
def submit_move(
    battle_id: UUID,
    data: MoveSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    state = battle_states.get(str(battle_id))
    if not state:
        raise HTTPException(status_code=404, detail="Battle state not found or expired")

    # Player is down to their last Pokemon
    if data.active_slot is not None:
        new_idx = next(
            (i for i, p in enumerate(state["team1"])
             if p["slot"] == data.active_slot and not p["fainted"]),
            None
        )
        if new_idx is not None:
            state["active1"] = new_idx

    if data.move_name is None:
        chosen_poke = state["team1"][state["active1"]]
        poke_name = chosen_poke["name"].capitalize()
        
        alive_count = len([p for p in state["team1"] if not p["fainted"]])
        if alive_count == 1:
            switch_log = [f"{state['team1_name']} is down to their last Pokémon!"]
            switch_log.append(f"Go! {poke_name}")
        else:
            switch_log = [f"Go! {poke_name}!"]

        return _build_response(state, switch_log, 0, 0, [])

    p1 = state["team1"][state["active1"]]
    p2 = state["team2"][state["active2"]]

    if p1["fainted"]:
        return _build_response(
            state, 
            [f"{p1['name'].capitalize()} is fainted! Please select a healthy Pokémon from your bench below to continue."], 
            0, 0, []
        )

    goes_first = state.get("goes_first", "team1")
    log = []
    fainted = []
    player_damage = 0
    opp_damage = 0

    def append_effectiveness_text(base_msg: str, move_type: str, def_type: str) -> str:
        eff = get_effectiveness(move_type.lower(), def_type.lower())
        if eff > 1.0:
            return base_msg + " It's super effective!"
        elif 0.0 < eff < 1.0:
            return base_msg + " It's not very effective..."
        elif eff == 0.0:
            return base_msg + " It had no effect!"
        return base_msg

    def check_battle_over():
        team1_alive = any(not p["fainted"] for p in state["team1"])
        team2_alive = any(not p["fainted"] for p in state["team2"])
        
        if not team2_alive:
            state["battle_over"] = True
            state["winner"] = "team1"
            log.append(f"{state['team1_name']} has won the battle!")
        elif not team1_alive:
            state["battle_over"] = True
            state["winner"] = "team2"
            log.append(f"{state['team2_name']} has won the battle!")

    def auto_switch_opponent():
        next_opp_idx = next((i for i, p in enumerate(state["team2"]) if not p["fainted"]), None)
        if next_opp_idx is not None:
            state["active2"] = next_opp_idx
            next_opp = state["team2"][next_opp_idx]
            log.append(f"{state['team2_name']} sent out {next_opp['name'].capitalize()}!")

    # If player goes first in start of the match
    if goes_first == "team1":

        m_type = data.move_type or "normal"
        player_damage = calculate_damage(
            data.move_power or 40, m_type.lower(),
            p1["attack"], p2["defense"], p2["type"].lower()
        )
        p2["current_hp"] = max(0, p2["current_hp"] - player_damage)
        _log_turn_to_db(battle_id, state["turn_number"], p1["slot"], data.move_name, data.move_power, player_damage, p2["slot"], True, db)
        
        action_msg = f"{p1['name'].capitalize()} used {data.move_name}! Dealt {player_damage} damage."
        action_msg = append_effectiveness_text(action_msg, m_type, p2["type"])
        log.append(action_msg)

        if p2["current_hp"] == 0:
            p2["fainted"] = True
            fainted.append(p2["name"])
            log.append(f"{p2['name'].capitalize()} fainted!")
            check_battle_over()
            if not state["battle_over"]:
                auto_switch_opponent()
            
            # Check victory here
            if state["battle_over"]:
                _end_battle(battle_id, state["winner"], db)
                return _build_response(state, log, player_damage, 0, fainted)
                
            state["turn_number"] += 1
            return _build_response(state, log, player_damage, 0, fainted)

        # Opponent responds second
        opp_moves = [m for m in p2["moves"] if (m.get("power") or 0) > 0] or p2["moves"]
        best_opp_move = max(opp_moves, key=lambda x: x.get("power", 0)) if opp_moves else {"name": "tackle", "power": 40, "type": "normal"}
        
        opp_move_type = best_opp_move.get("type", "normal")
        opp_damage = calculate_damage(
            best_opp_move.get("power", 40), opp_move_type.lower(),
            p2["attack"], p1["defense"], p1["type"].lower()
        )
        p1["current_hp"] = max(0, p1["current_hp"] - opp_damage)
        _log_turn_to_db(battle_id, state["turn_number"], p2["slot"], best_opp_move["name"], best_opp_move.get("power"), opp_damage, p1["slot"], False, db)
        
        opp_msg = f"{p2['name'].capitalize()} used {best_opp_move['name']}! Dealt {opp_damage} damage."
        opp_msg = append_effectiveness_text(opp_msg, opp_move_type, p1["type"])
        log.append(opp_msg)

        if p1["current_hp"] == 0:
            p1["fainted"] = True
            fainted.append(p1["name"])
            log.append(f"Your {p1['name'].capitalize()} fainted!")
            check_battle_over()

        if state["battle_over"]:
            _end_battle(battle_id, state["winner"], db)
            return _build_response(state, log, player_damage, opp_damage, fainted)

        state["turn_number"] += 1
        return _build_response(state, log, player_damage, opp_damage, fainted)

    else:
        # If opponent goes first instead
        current_turn = state.get("turn_number", 1)

        # Submit a standalone opponent move
        if current_turn == 1:
            opp_moves = [m for m in p2["moves"] if (m.get("power") or 0) > 0] or p2["moves"]
            best_opp_move = max(opp_moves, key=lambda x: x.get("power", 0)) if opp_moves else {"name": "tackle", "power": 40, "type": "normal"}
            
            opp_move_type = best_opp_move.get("type", "normal")
            opp_damage = calculate_damage(
                best_opp_move.get("power", 40), opp_move_type.lower(),
                p2["attack"], p1["defense"], p1["type"].lower()
            )
            p1["current_hp"] = max(0, p1["current_hp"] - opp_damage)
            _log_turn_to_db(battle_id, 1, p2["slot"], best_opp_move["name"], best_opp_move.get("power"), opp_damage, p1["slot"], False, db)
            
            opp_msg = f"{p2['name'].capitalize()} used {best_opp_move['name']}! Dealt {opp_damage} damage."
            opp_msg = append_effectiveness_text(opp_msg, opp_move_type, p1["type"])
            log.append(opp_msg)

            if p1["current_hp"] == 0:
                p1["fainted"] = True
                fainted.append(p1["name"])
                log.append(f"Your {p1['name'].capitalize()} fainted!")
                check_battle_over()

            if state["battle_over"]:
                _end_battle(battle_id, state["winner"], db)
                return _build_response(state, log, 0, opp_damage, fainted)

            state["turn_number"] = 2
            return _build_response(state, log, 0, opp_damage, fainted)

        # The turn count is even so player moves
        else:
            # Action A: Player Attack
            m_type = data.move_type or "normal"
            player_damage = calculate_damage(
                data.move_power or 40, m_type.lower(),
                p1["attack"], p2["defense"], p2["type"].lower()
            )
            p2["current_hp"] = max(0, p2["current_hp"] - player_damage)
            _log_turn_to_db(battle_id, state["turn_number"], p1["slot"], data.move_name, data.move_power, player_damage, p2["slot"], True, db)
            
            action_msg = f"Your {p1['name'].capitalize()} used {data.move_name}! Dealt {player_damage} damage."
            action_msg = append_effectiveness_text(action_msg, m_type, p2["type"])
            log.append(action_msg)

            if p2["current_hp"] == 0:
                p2["fainted"] = True
                fainted.append(p2["name"])
                log.append(f"{p2['name'].capitalize()} fainted!")
                check_battle_over()
                if not state["battle_over"]:
                    auto_switch_opponent()
                
                if state["battle_over"]:
                    _end_battle(battle_id, state["winner"], db)
                    return _build_response(state, log, player_damage, 0, fainted)
                    
                state["turn_number"] += 1
                return _build_response(state, log, player_damage, 0, fainted)

            # Action B: Opponent Counter-Attack
            opp_moves = [m for m in p2["moves"] if (m.get("power") or 0) > 0] or p2["moves"]
            best_opp_move = max(opp_moves, key=lambda x: x.get("power", 0)) if opp_moves else {"name": "tackle", "power": 40, "type": "normal"}
            
            opp_move_type = best_opp_move.get("type", "normal")
            opp_damage = calculate_damage(
                best_opp_move.get("power", 40), opp_move_type.lower(),
                p2["attack"], p1["defense"], p1["type"].lower()
            )
            p1["current_hp"] = max(0, p1["current_hp"] - opp_damage)
            _log_turn_to_db(battle_id, state["turn_number"], p2["slot"], best_opp_move["name"], best_opp_move.get("power"), opp_damage, p1["slot"], False, db)
            
            opp_msg = f"{p2['name'].capitalize()} used {best_opp_move['name']}! Dealt {opp_damage} damage."
            opp_msg = append_effectiveness_text(opp_msg, opp_move_type, p1["type"])
            log.append(opp_msg)

            if p1["current_hp"] == 0:
                p1["fainted"] = True
                fainted.append(p1["name"])
                log.append(f"Your {p1['name'].capitalize()} fainted!")
                check_battle_over()

            if state["battle_over"]:
                _end_battle(battle_id, state["winner"], db)
                return _build_response(state, log, player_damage, opp_damage, fainted)

            state["turn_number"] += 1
            return _build_response(state, log, player_damage, opp_damage, fainted)


def _end_battle(battle_id: UUID, winner: str, db: Session):
    battle = db.query(Battle).filter(Battle.id == battle_id).first()
    if battle:
        battle.winner = winner
        db.commit()
    # Clean up memory
    battle_states.pop(str(battle_id), None)


def _build_response(state, log, player_damage, opp_damage, fainted):
    return {
        "turn_number":    state["turn_number"],
        "player_pokemon": state["team1"][state["active1"]],
        "opponent_pokemon": state["team2"][state["active2"]],
        "player_team":    state["team1"],
        "opponent_team":  state["team2"],
        "log":            log,
        "player_damage":  player_damage,
        "opponent_damage":opp_damage,
        "fainted":        fainted,
        "battle_over":    state["battle_over"],
        "winner":         state["winner"],
        "team1_name":     state["team1_name"],
        "team2_name":     state["team2_name"],
    }

@router.get("/history")
def get_battle_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    t1 = aliased(PokemonTeam)
    t2 = aliased(PokemonTeam)

    # Calculate the max turn number for each battle record from your battle_turns table
    turn_counts = db.query(
        BattleTurn.battle_id,
        func.max(BattleTurn.turn_number).label("max_turn")
    ).group_by(BattleTurn.battle_id).subquery()

    battles_data = db.query(
        Battle,
        t1.team_name.label("team1_name"),
        t2.team_name.label("team2_name"),
        func.coalesce(turn_counts.c.max_turn, 0).label("turn_count")
    ).outerjoin(t1, Battle.team1_id == t1.id)\
     .outerjoin(t2, Battle.team2_id == t2.id)\
     .outerjoin(turn_counts, Battle.id == turn_counts.c.battle_id)\
     .filter(Battle.user_id == current_user.id)\
     .filter(Battle.winner.isnot(None))\
     .order_by(Battle.created_at.desc()).all()

    result = []
    for row in battles_data:
        b = row.Battle
        result.append({
            "id":         str(b.id),
            "created_at": b.created_at.replace(tzinfo=timezone.utc).isoformat() if b.created_at else None,
            "team1_name": row.team1_name or "Unknown",
            "team2_name": row.team2_name or "Unknown",
            "winner":     b.winner,
            "turns":      int(row.turn_count), 
        })
        
    return result

@router.delete("/history")
def clear_battle_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Battle).filter(Battle.user_id == current_user.id).delete(synchronize_session=False)
    db.commit()
    return {"message": "Battle history cleared successfully"}