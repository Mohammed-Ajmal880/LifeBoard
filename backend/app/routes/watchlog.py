from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user,  get_current_user
from app.models.user import User
from app.models import PokemonWatchlog
from app.schemas.pokemon import WatchLogCreate, WatchLogUpdate, WatchLogOut
from uuid import UUID
from typing import List

router = APIRouter(
    prefix="/watchlog",
    tags=["Pokemon Watch Log"]
)

@router.get("/", response_model=List[WatchLogOut])
def get_watchlog(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    return db.query(PokemonWatchlog).filter(
        PokemonWatchlog.user_id == current_user.id
    ).order_by(PokemonWatchlog.season, PokemonWatchlog.episode_number).all()

@router.post("/", response_model=WatchLogOut)
def create_watchlog_entry(
    data: WatchLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    existing = db.query(PokemonWatchlog).filter(
        PokemonWatchlog.user_id == current_user.id,
        PokemonWatchlog.season == data.season,
        PokemonWatchlog.episode_number == data.episode_number
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Episode already logged for this season"
        )

    entry = PokemonWatchlog(
        user_id = current_user.id,
        season = data.season,
        episode_number = data.episode_number,
        episode_title = data.episode_title,
        watched = data.watched,
        watched_date = data.watched_date
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.patch("/{watchlog_id}", response_model=WatchLogOut)
def update_watchlog_entry(
    watchlog_id: UUID,
    data: WatchLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    entry = db.query(PokemonWatchlog).filter(
        PokemonWatchlog.id == watchlog_id,
        PokemonWatchlog.user_id == current_user.id
    ).first()

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watch log entry not found"
        )
    
    if data.episode_title is not None:
        entry.episode_title = data.episode_title

    if data.watched is not None:
        entry.watched = data.watched

    if data.watched_date is not None:
        entry.watched_date = data.watched_date

    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{watchlog_id}")
def delete_watchlog_entry(
    watchlog_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    entry = db.query(PokemonWatchlog).filter(
        PokemonWatchlog.id == watchlog_id,
        PokemonWatchlog.user_id == current_user.id,
    ).first()

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watch log entry not found"
        )
    
    db.delete(entry)
    db.commit()
    return {"message": "Watchlog entry deleted successfully"}