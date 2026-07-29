from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models import PokemonTeam, TeamMember
from app.schemas.pokemon import TeamCreate, TeamUpdate, TeamOut, TeamMemberCreate, TeamMemberUpdate, TeamMemberOut
from app.auth import get_current_user
from uuid import UUID
from typing import List

router = APIRouter(
    prefix="/pokemon_team",
    tags=["Pokemon Team"]
)

@router.get("/", response_model=List[TeamOut])
def get_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    return db.query(PokemonTeam).filter(
        PokemonTeam.user_id == current_user.id
    ).order_by(PokemonTeam.created_at.desc()).all()

@router.post("/", response_model=TeamOut)
def create_team(
    data: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    team = PokemonTeam(
        user_id=current_user.id,
        team_name=data.team_name
    )

    db.add(team)
    db.commit()
    db.refresh(team)
    return team

@router.patch("/{team_id}", response_model=TeamOut)
def update_team(
    team_id: UUID,
    data: TeamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    team = db.query(PokemonTeam).filter(
        PokemonTeam.id == team_id,
        PokemonTeam.user_id == current_user.id
    ).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    team.team_name = data.team_name
    db.commit()
    db.refresh(team)
    return team

@router.delete("/{team_id}")
def delete_team(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    team = db.query(PokemonTeam).filter(
        PokemonTeam.id == team_id,
        PokemonTeam.user_id == current_user.id
    ).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    db.delete(team)
    db.commit()
    return {"message": "Team deleted successfully"}

# Team Member Endpoints

@router.get("/{team_id}/members", response_model=List[TeamMemberOut])
def get_team_members(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    team = db.query(PokemonTeam).filter(
        PokemonTeam.id == team_id,
        PokemonTeam.user_id == current_user.id
    ).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    return db.query(TeamMember).filter(
        TeamMember.team_id == team_id
    ).order_by(TeamMember.slot).all()

@router.post("/{team_id}/members", response_model=TeamMemberOut)
def add_team_member(
    team_id: UUID,
    data: TeamMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    team = db.query(PokemonTeam).filter(
        PokemonTeam.id == team_id,
        PokemonTeam.user_id == current_user.id
    ).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    if data.slot < 1 or data.slot > 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slot must be between 1 and 6"
        )
    
    existing_slot = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.slot == data.slot
    ).first()

    if existing_slot:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Slot {data.slot} is already occupied"
        )
    
    member = TeamMember(
        team_id=team_id,
        pokedex_number=data.pokedex_number,
        slot=data.slot,
        nickname=data.nickname
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

@router.patch("/{team_id}/members/{slot}", response_model=TeamMemberOut)
def update_team_member(
    data: TeamMemberUpdate,
    team_id: UUID,
    slot: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    team = db.query(PokemonTeam).filter(
        PokemonTeam.id == team_id, 
        PokemonTeam.user_id == current_user.id
    ).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.slot == slot
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No member found in slot {slot}"
        )
    
    member.pokedex_number = data.pokedex_number 
    if data.nickname is not None:
        member.nickname = data.nickname

    db.commit()
    db.refresh(member)
    return member

@router.delete("/{team_id}/members/{slot}")
def delete_team_member(
    team_id: UUID,
    slot: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    team = db.query(PokemonTeam).filter(
        PokemonTeam.id == team_id, 
        PokemonTeam.user_id == current_user.id
    ).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.slot == slot
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No Pokemon found in slot {slot}"
        )
    
    db.delete(member)
    db.commit()
    return {"message": f"Pokemon in slot {slot} deleted successfully"}