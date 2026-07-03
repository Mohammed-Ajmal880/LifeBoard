from fastAPI import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.mc_session import MCSessions
from app.schemas.mc import MCSessionCreate, MCSessionUpdate, MCSessionOut
from typing import List
import uuid

router = APIRouter(
    prefix="/mc_sessions",
    tags=["Minecraft Sessions"]
)

@router.get("/", response_model=List[MCSessionOut])
def get_sessions(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
    ):

    return db.query(MCSessions).filter(MCSessions.user_id == current_user.id).order_by(MCSessions.created_at.desc()).all()

@router.post("/", response_model=MCSessionOut)
def create_session(
    data: MCSessionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    
    session = MCSession(
        user_id=current_user.id,
        world_name=data.world_name,
        session_date=data.session_date,
        duration_minutes=data.duration_minutes,
        description=data.description
    )

    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.patch("/{session_id}", response_model=MCSessionOut)
def update_session(
    session_id: uuid.UUID,
    data: MCSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    session = db.query(MCSession).filter(
        MCSession.id == session_id,
        MCSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
            )
    
    if data.world_name is not None:
        session.world_name = data.world_name

    if data.session_date is not None:
        session.session_date = data.session_date

    if data.duration_minutes is not None:
        session.duration_minutes = data.duration_minutes

    if data.description is not None:
        session.description = data.description

    db.commit()
    db.refresh(session)
    return session

@router.delete("/{session_id}")
def delete_session(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    session = db.query(MCSession).filter(
        MCSession.id == session_id,
        MCSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
            )
    
    db.delete(session)
    db.commit()
    return {"message": "Session deleted successfully"}

