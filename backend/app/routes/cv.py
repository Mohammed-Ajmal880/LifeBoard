from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.cv_version import CVVersion
from app.schemas.cv import CVVersionOut
from app.storage import upload_cv, get_cv_signed_url, delete_cv
from typing import List
from uuid import UUID
import uuid

router = APIRouter(prefix="/cvs", tags=["CV Versions"])

@router.post("/upload", response_model=CVVersionOut)
async def upload_cv_route(
    label: str = Form(...),
    type:  str = Form(...),
    file:  UploadFile = File(...),
    db:    Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    allowed_types = ["application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_bytes    = await file.read()
    unique_name   = f"{current_user.id}/{uuid.uuid4()}_{file.filename}"

    # Upload to Supabase Storage
    storage_path = upload_cv(file_bytes, unique_name, file.content_type)

    cv = CVVersion(
        user_id   = current_user.id,
        label     = label,
        file_name = file.filename,
        file_path = storage_path,
        type      = type,
    )
    db.add(cv)
    db.commit()
    db.refresh(cv)
    return cv


@router.get("/", response_model=List[CVVersionOut])
def get_cvs(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    return db.query(CVVersion).filter(
        CVVersion.user_id == current_user.id
    ).all()


@router.get("/{cv_id}/url")
def get_cv_url(
    cv_id:        UUID,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    cv = db.query(CVVersion).filter(
        CVVersion.id      == cv_id,
        CVVersion.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")

    signed_url = get_cv_signed_url(cv.file_path)
    return { "url": signed_url, "file_name": cv.file_name }


@router.patch("/{cv_id}", response_model=CVVersionOut)
async def update_cv(
    cv_id: UUID,
    label: str = Form(None),
    type:  str = Form(None),
    file:  UploadFile = File(None),
    db:    Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cv = db.query(CVVersion).filter(
        CVVersion.id      == cv_id,
        CVVersion.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")

    if label is not None:
        cv.label = label
    if type is not None:
        cv.type = type

    if file is not None:
        # Delete old file from Supabase
        try:
            delete_cv(cv.file_path)
        except Exception:
            pass

        # Upload new file
        file_bytes   = await file.read()
        unique_name  = f"{current_user.id}/{uuid.uuid4()}_{file.filename}"
        storage_path = upload_cv(file_bytes, unique_name, file.content_type)
        cv.file_path = storage_path
        cv.file_name = file.filename

    db.commit()
    db.refresh(cv)
    return cv


@router.delete("/{cv_id}")
def delete_cv_route(
    cv_id:        UUID,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    cv = db.query(CVVersion).filter(
        CVVersion.id      == cv_id,
        CVVersion.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")

    try:
        delete_cv(cv.file_path)
    except Exception:
        pass

    db.delete(cv)
    db.commit()
    return {"message": "CV deleted successfully"}