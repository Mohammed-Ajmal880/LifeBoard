from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.application import Application
from app.models.pokemon_watchlog import PokemonWatchlog
from app.models.mc_session import MCSession
from app.models.mc_goal import MCGoal
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ── InternTrack ───────────────────────────────
    active_applications = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.status.in_(["applied", "interview"])
    ).count()

    # ── PokeLog ───────────────────────────────────
    episodes_watched = db.query(PokemonWatchlog).filter(
        PokemonWatchlog.user_id == current_user.id,
        PokemonWatchlog.watched == True
    ).count()

    # ── MinecraftStats ────────────────────────────
    goals_in_progress = db.query(MCGoal).filter(
        MCGoal.user_id == current_user.id,
        MCGoal.completed == False
    ).count()

    total_sessions = db.query(MCSession).filter(
        MCSession.user_id == current_user.id
    ).count()

    # Weekly playtime — current week Mon to today
    today = datetime.now(timezone.utc).date()
    monday = today - timedelta(days=today.weekday())

    weekly_minutes = db.query(
        func.sum(MCSession.duration_minutes)
    ).filter(
        MCSession.user_id == current_user.id,
        MCSession.session_date >= monday
    ).scalar() or 0

    weekly_playtime_hours = round(weekly_minutes / 60, 1)

    # ── Module card stats ─────────────────────────
    total_applications = db.query(Application).filter(
        Application.user_id == current_user.id
    ).count()

    return {
        "username": current_user.username,
        "module_stats": {
            "interntrack": {
                "active_applications": total_applications
            },
            "pokelog": {
                "episodes_watched": episodes_watched
            },
            "minecraftstats": {
                "total_sessions": total_sessions
            }
        },
        "glance": {
            "apps_awaiting_reply": active_applications,
            "episodes_watched": episodes_watched,
            "goals_in_progress": goals_in_progress,
            "weekly_playtime_hours": weekly_playtime_hours
        }
    }