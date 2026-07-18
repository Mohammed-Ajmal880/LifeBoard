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

# ── Type effectiveness chart ──────────────────────────────
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
        moves_raw = data.get("moves", [])[:4]
        moves = []
        for m in moves_raw:
            move_name = m["move"]["name"]
            move_res  = await client.get(f"https://pokeapi.co/api/v2/move/{move_name}")
            move_data = move_res.json()
            moves.append({
                "name":   move_name,
                "power":  move_data.get("power") or 40,
                "type":   move_data["type"]["name"],
            })
        stats     = {s["stat"]["name"]: s["base_stat"] for s in data["stats"]}
        poke_type = data["types"][0]["type"]["name"]
        return {
            "name":    data["name"],
            "type":    poke_type,
            "hp":      stats.get("hp", 45),
            "attack":  stats.get("attack", 45),
            "defense": stats.get("defense", 45),
            "moves":   moves,
            "sprite":  data["sprites"]["front_default"],
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
        f"⚔️ Battle started between {team1.team_name} and {team2.team_name}!",
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


@router.post("/{battle_id}/move")
def submit_move(
    battle_id:    UUID,
    data:         MoveSubmit,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    state = battle_states.get(str(battle_id))

    if not state:
        raise HTTPException(status_code=404, detail="Battle not found or expired")

    if state["battle_over"]:
        raise HTTPException(status_code=400, detail="Battle is already over")

    if data.active_slot is not None:
        new_idx = next(
            (i for i, p in enumerate(state["team1"])
             if p["slot"] == data.active_slot and not p["fainted"]),
                None
        )
        if new_idx is not None:
            state["active1"] = new_idx

    # If this is just a switch with no move, return updated state
    if data.move_name is None:
        # Find out who was just sent out
        chosen_poke = state["team1"][state["active1"]]
        poke_name = chosen_poke["name"].capitalize()
        
        # Count how many living teammates are left on your bench
        alive_count = len([p for p in state["team1"] if not p["fainted"]])
        
        if alive_count == 1:
            switch_log = [f"🔴 {state['team1_name']} is down to their last Pokémon! Go, {poke_name}!"]
        else:
            switch_log = [f"Go! {poke_name}!"]
            
        return _build_response(state, switch_log, 0, 0, [])

    log         = []
    fainted     = []
    player_damage = 0
    opp_damage    = 0
    
    active1_idx = state["active1"]
    active2_idx = state["active2"]
    attacker    = state["team1"][active1_idx] # Player
    defender    = state["team2"][active2_idx] # Opponent AI

    # Opponent attacks first
    if getattr(data, "submitted_by", "player") == "opponent":
        opp_damage = calculate_damage(
            data.move_power or 40, data.move_type,
            defender["attack"], attacker["defense"], attacker["type"],
        )
        attacker["current_hp"] = max(0, attacker["current_hp"] - opp_damage)
        opp_eff = get_effectiveness(data.move_type, attacker["type"])
        opp_eff_text = ""
        if opp_eff == 2:   opp_eff_text = " It's super effective!"
        if opp_eff == 0.5: opp_eff_text = " It's not very effective..."
        log.append(f"{defender['name'].capitalize()} used {data.move_name}! Dealt {opp_damage} damage.{opp_eff_text}")

        if attacker["current_hp"] == 0:
            attacker["fainted"] = True
            fainted.append(attacker["name"])
            log.append(f"{attacker['name'].capitalize()} fainted!")

            # Look for any remaining living Pokémon to determine if the game is over
            next1 = next((i for i, p in enumerate(state["team1"]) if not p["fainted"]), None)
            if next1 is None:
                state["battle_over"] = True
                state["winner"]      = "team2"
                log.append(f"All of {state['team1_name']} fainted! {state['team2_name']} wins!")
                _end_battle(battle_id, "team2", db)
                return _build_response(state, log, 0, opp_damage, fainted)

        state["turn_number"] += 1

        if data.move_name is not None:
            turn = BattleTurn(
                battle_id      = battle_id,
                turn_number    = state["turn_number"],
                attacker_slot  = state["team2"][active2_idx]["slot"],
                move_name      = data.move_name,
                move_power     = data.move_power,
                damage_dealt   = opp_damage,
                target_slot    = state["team1"][active1_idx]["slot"],
                is_player_turn = "opponent",
            )
            db.add(turn)
            db.commit()

        return _build_response(state, log, 0, opp_damage, fainted)

    # 2. Standard logic 
    base_first = state.get("goes_first", "team1")
    
    if base_first == "team2":
        # If opponent goes first overall, they should initiate on odd turns (1, 3, 5...)
        # and player initiates on even turns (2, 4, 6...)
        goes_first = "team2" if state["turn_number"] % 2 != 0 else "team1"
    else:
        # If player goes first overall, player initiates on odd turns (1, 3, 5...)
        goes_first = "team1" if state["turn_number"] % 2 != 0 else "team2"

    if goes_first == "team1":
        # ── Player attacks first ──
        player_damage = calculate_damage(
            data.move_power or 40, data.move_type,
            attacker["attack"], defender["defense"], defender["type"],
        )
        defender["current_hp"] = max(0, defender["current_hp"] - player_damage)
        effectiveness = get_effectiveness(data.move_type, defender["type"])
        eff_text = ""
        if effectiveness == 2:   eff_text = " It's super effective!"
        if effectiveness == 0.5: eff_text = " It's not very effective..."
        if effectiveness == 0:   eff_text = " It had no effect."
        log.append(f"{attacker['name'].capitalize()} used {data.move_name}! Dealt {player_damage} damage.{eff_text}")

        if defender["current_hp"] == 0:
            defender["fainted"] = True
            fainted.append(defender["name"])
            log.append(f"{defender['name'].capitalize()} fainted!")
            next2 = next((i for i, p in enumerate(state["team2"]) if not p["fainted"]), None)
            if next2 is None:
                state["battle_over"] = True
                state["winner"]      = "team1"
                log.append(f"All of {state['team2_name']} fainted! {state['team1_name']} wins!")
                _end_battle(battle_id, "team1", db)
                return _build_response(state, log, player_damage, 0, fainted)
            state["active2"] = next2
            defender         = state["team2"][next2]

            opp_alive_count = len([p for p in state["team2"] if not p["fainted"]])
            if opp_alive_count == 1:
                log.append(f"{state['team2_name']} sends out their last Pokémon: {defender['name'].capitalize()}!")
            else:
                log.append(f"{state['team2_name']} sent out {defender['name'].capitalize()}!")

        # Opponent AI counter-attacks second
        opp_moves = [m for m in defender["moves"] if (m.get("power") or 0) > 0] or defender["moves"]
        opp_move      = max(opp_moves, key=lambda m: m.get("power") or 0)
        opp_damage    = calculate_damage(
            opp_move.get("power") or 40, opp_move["type"],
            defender["attack"], attacker["defense"], attacker["type"],
        )
        attacker["current_hp"] = max(0, attacker["current_hp"] - opp_damage)
        opp_eff      = get_effectiveness(opp_move["type"], attacker["type"])
        opp_eff_text = ""
        if opp_eff == 2:   opp_eff_text = " It's super effective!"
        if opp_eff == 0.5: opp_eff_text = " It's not very effective..."
        log.append(f"{defender['name'].capitalize()} used {opp_move['name']}! Dealt {opp_damage} damage.{opp_eff_text}")

        if attacker["current_hp"] == 0:
            attacker["fainted"] = True
            fainted.append(attacker["name"])
            log.append(f"{attacker['name'].capitalize()} fainted!")
            next1 = next((i for i, p in enumerate(state["team1"]) if not p["fainted"]), None)
            if next1 is None:
                state["battle_over"] = True
                state["winner"]      = "team2"
                log.append(f"All of {state['team1_name']} fainted! {state['team2_name']} wins!")
                _end_battle(battle_id, "team2", db)
                return _build_response(state, log, player_damage, opp_damage, fainted)

    else:
        # Player attacks second  
        opp_moves = [m for m in defender["moves"] if (m.get("power") or 0) > 0] or defender["moves"]
        opp_move      = max(opp_moves, key=lambda m: m.get("power") or 0)
        opp_damage    = calculate_damage(
            opp_move.get("power") or 40, opp_move["type"],
            defender["attack"], attacker["defense"], attacker["type"],
        )
        attacker["current_hp"] = max(0, attacker["current_hp"] - opp_damage)
        opp_eff      = get_effectiveness(opp_move["type"], attacker["type"])
        opp_eff_text = ""
        if opp_eff == 2:   opp_eff_text = " It's super effective!"
        if opp_eff == 0.5: opp_eff_text = " It's not very effective..."
        log.append(f"{defender['name'].capitalize()} used {opp_move['name']}! Dealt {opp_damage} damage.{opp_eff_text}")

        if attacker["current_hp"] == 0:
            attacker["fainted"] = True
            fainted.append(attacker["name"])
            log.append(f"{attacker['name'].capitalize()} fainted!")
            next1 = next((i for i, p in enumerate(state["team1"]) if not p["fainted"]), None)
            if next1 is None:
                state["battle_over"] = True
                state["winner"]      = "team2"
                log.append(f"All of {state['team1_name']} fainted! {state['team2_name']} wins!")
                _end_battle(battle_id, "team2", db)
                return _build_response(state, log, 0, opp_damage, fainted)
            
        if not attacker["fainted"]:
            player_damage = calculate_damage(
                data.move_power or 40, data.move_type,
                attacker["attack"], defender["defense"], defender["type"],
            )
            defender["current_hp"] = max(0, defender["current_hp"] - player_damage)
            effectiveness = get_effectiveness(data.move_type, defender["type"])
            eff_text = ""
            if effectiveness == 2:   eff_text = " It's super effective!"
            if effectiveness == 0.5: eff_text = " It's not very effective..."
            if effectiveness == 0:   eff_text = " It had no effect."
            log.append(f"{attacker['name'].capitalize()} used {data.move_name}! Dealt {player_damage} damage.{eff_text}")

            if defender["current_hp"] == 0:
                defender["fainted"] = True
                fainted.append(defender["name"])
                log.append(f"{defender['name'].capitalize()} fainted!")
                next2 = next((i for i, p in enumerate(state["team2"]) if not p["fainted"]), None)
                if next2 is None:
                    state["battle_over"] = True
                    state["winner"]      = "team1"
                    log.append(f"All of {state['team2_name']} fainted! {state['team1_name']} wins!")
                    _end_battle(battle_id, "team1", db)
                    return _build_response(state, log, player_damage, opp_damage, fainted)
                state["active2"] = next2
                
                # Count how many living opponent Pokémon are left
                opp_alive_count = len([p for p in state["team2"] if not p["fainted"]])
                if opp_alive_count == 1:
                    log.append(f"{state['team2_name']} sends out their last Pokémon: {defender['name'].capitalize()}!")
                else:
                    log.append(f"{state['team2_name']} sent out {defender['name'].capitalize()}!")

    state["turn_number"] += 1

    turn = BattleTurn(
        battle_id      = battle_id,
        turn_number    = state["turn_number"],
        attacker_slot  = state["team1"][active1_idx]["slot"],
        move_name      = data.move_name,
        move_power     = data.move_power,
        damage_dealt   = player_damage,
        target_slot    = state["team2"][active2_idx]["slot"],
        is_player_turn = "player",
    )
    db.add(turn)
    db.commit()

    return _build_response(state, log, player_damage, opp_damage, fainted)


def _end_battle(battle_id: UUID, winner: str, db: Session):
    battle = db.query(Battle).filter(Battle.id == battle_id).first()
    if battle:
        battle.winner = winner
        db.commit()
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

    turn_counts = db.query(
        BattleTurn.battle_id,
        func.count(BattleTurn.id).label("turn_count")
    ).group_by(BattleTurn.battle_id).subquery()

    battles_data = db.query(
        Battle,
        t1.team_name.label("team1_name"),
        t2.team_name.label("team2_name"),
        func.coalesce(turn_counts.c.turn_count, 0).label("turns")
    ).outerjoin(t1, Battle.team1_id == t1.id)\
     .outerjoin(t2, Battle.team2_id == t2.id)\
     .outerjoin(turn_counts, Battle.id == turn_counts.c.battle_id)\
     .filter(Battle.user_id == current_user.id)\
     .filter(Battle.winner.isnot(None)) \
     .order_by(Battle.created_at.desc()).all()

    result = []
    for row in battles_data:
        b = row.Battle
        result.append({
            "id":         str(b.id),
            "created_at": b.created_at.isoformat(),
            "team1_name": row.team1_name or "Unknown",
            "team2_name": row.team2_name or "Unknown",
            "winner":     b.winner,
            "turns":      int(row.turns),
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