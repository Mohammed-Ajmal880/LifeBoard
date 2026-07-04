from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models import MCGoal
from app.schemas.mc import MCGoalCreate, MCGoalUpdate, MCGoalOut
from app.auth import get_current_user
from typing import List
from uuid import UUID

router = APIRouter(
    prefix="/goals", 
    tags=["Minecraft Goals"]
)

@router.get("/", response_model=List[MCGoalOut])
def get_goals(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return db.query(MCGoal).filter(
        MCGoal.user_id == current_user.id
    ).order_by(MCGoal.created_at.desc()).all()

@router.post("/", response_model=MCGoalOut)
def create_goal(
    data: MCGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    goal = MCGoal(
        user_id = current_user.id,
        title = data.title,
        completed = False
    )

    db.add(goal)
    db.commit()
    db.refresh(goal)

    return goal

@router.patch("/{goal_id}", response_model=MCGoalOut)
def update_goal(
    goal_id: UUID,
    data: MCGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    goal =db.query(MCGoal).filter(
        MCGoal.id == goal_id,
        MCGoal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    if data.title is not None:
        goal.title = data.title

    if data.completed is not None:
        goal.completed = data.completed

    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: UUID,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    
    goal = db.query(MCGoal).filter(
        MCGoal.id == goal_id,
        MCGoal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted successfully"}