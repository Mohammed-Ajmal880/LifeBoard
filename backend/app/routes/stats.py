from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.application import Application
from app.models.cv_version import CVVersion
from sqlalchemy import func

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/interntrack")
def get_interntrack_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total applications
    total = db.query(Application).filter(
        Application.user_id == current_user.id
    ).count()

    # Count by status
    by_status = db.query(
        Application.status,
        func.count(Application.id).label("count")
    ).filter(
        Application.user_id == current_user.id
    ).group_by(Application.status).all()

    status_breakdown = {row.status: row.count for row in by_status}

    # Response rate = interviews + offers / total
    interviews = status_breakdown.get("interview", 0)
    offers = status_breakdown.get("offer", 0)
    response_rate = round((interviews + offers) / total * 100, 1) if total > 0 else 0

    # CV usage — how many times each CV was used
    cv_usage = db.query(
        CVVersion.label,
        CVVersion.type,
        func.count(Application.id).label("times_used")
    ).outerjoin(
        Application, Application.cv_version_id == CVVersion.id
    ).filter(
        CVVersion.user_id == current_user.id
    ).group_by(
        CVVersion.id,
        CVVersion.label,
        CVVersion.type
    ).all()

    return {
        "total_applications": total,
        "status_breakdown": status_breakdown,
        "response_rate": response_rate,
        "cv_usage": [
            {
                "label": row.label,
                "type": row.type,
                "times_used": row.times_used
            }
            for row in cv_usage
        ]
    }