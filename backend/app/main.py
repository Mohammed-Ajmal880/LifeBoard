from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
import app.models
from app.routes.auth import router as auth_router
from app.routes.cv import router as cv_router
from app.routes.application import router as application_router
from app.routes.stats import router as stats_router
from app.routes.mc_session import router as mc_session_router
from app.routes.mc_goal import router as mc_goal_router
from app.routes.watchlog import router as watchlog_router
from app.routes.pokemon_team import router as pokemon_team_router
from app.routes.dashboard import router as dashboard_router

app = FastAPI(title="LifeBoard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://life-board-yv5-chi.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
app.include_router(auth_router)
app.include_router(cv_router)
app.include_router(application_router)
app.include_router(stats_router)
app.include_router(mc_session_router)
app.include_router(mc_goal_router)
app.include_router(watchlog_router)
app.include_router(pokemon_team_router)
app.include_router(dashboard_router)

@app.get("/")
def root():
    return {"message": "LifeBoard API is running"}