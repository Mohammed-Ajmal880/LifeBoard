import os
import shutil
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.cv_version import CVVersion
from app.schemas.cv import CVVersionOut
from typing import List
from uuid import UUID, uuid4

router = APIRouter(prefix="/cvs", tags=["CV Versions"])

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads", "cvs")

os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=CVVersionOut)
def upload_cv(
    label: str = Form(...),
    type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
    ):

    allowed_types=["application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    unique_filename = f"{uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    cv = CVVersion(
        user_id=current_user.id,
        label=label,
        file_name=file.filename,
        file_path=file_path,
        type=type
    )

    db.add(cv)
    db.commit()
    db.refresh(cv)
    return cv


@router.get("/", response_model=List[CVVersionOut])
def get_cvs(
    db: Session = Depends(get_db),
    current_user: Session = Depends(get_current_user)
    ):
    return db.query(CVVersion).filter(CVVersion.user_id == current_user.id).all()

@router.patch("/{cv_id}", response_model=CVVersionOut)
def update_cv(
    cv_id: UUID,
    label: str = Form(None),
    type: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cv = db.query(CVVersion).filter(
        CVVersion.id == cv_id,
        CVVersion.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )

    if label is not None:
        cv.label = label
    if type is not None:
        cv.type = type

    db.commit()
    db.refresh(cv)
    return cv

@router.delete("/{cv_id}")
def delete_cv(
    cv_id: UUID,
    db: Session = Depends(get_db),
    current_user: Session = Depends(get_current_user)
):
    
    cv = db.query(CVVersion).filter(
        CVVersion.id == cv_id,
        CVVersion.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    
    if os.path.exists(cv.file_path):
        os.remove(cv.file_path)

    db.delete(cv)
    db.commit()
    return {"message": "CV deleted successfully"}



