from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationOut
from typing import List
from uuid import UUID

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.post("/", response_model=ApplicationOut)
def create_application(
    data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    application = Application(
        user_id=current_user.id,
        company=data.company,
        role=data.role,
        applied_date=data.applied_date,
        cv_version_id=data.cv_version_id,
        notes=data.notes,
        status="applied"
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get("/", response_model=List[ApplicationOut])
def get_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Application).filter(
        Application.user_id == current_user.id
    ).order_by(Application.applied_date.desc()).all()


@router.patch("/{application_id}", response_model=ApplicationOut)
def update_application(
    application_id: UUID,
    data: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    if data.status is not None:
        allowed_statuses = ["applied", "interview", "offer", "rejected"]
        if data.status not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Status must be one of: {allowed_statuses}"
            )
        application.status = data.status

    if data.notes is not None:
        application.notes = data.notes

    if data.cv_version_id is not None:
        application.cv_version_id = data.cv_version_id

    db.commit()
    db.refresh(application)
    return application


@router.delete("/{application_id}")
def delete_application(
    application_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    db.delete(application)
    db.commit()
    return {"message": "Application deleted successfully"}