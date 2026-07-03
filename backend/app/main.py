from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
import app.models
from app.routes.auth import router as auth_router
from app.routes.cv import router as cv_router
from app.routes.application import router as application_router
from app.routes.stats import router as stats_router

app = FastAPI(title="LifeBoard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
app.include_router(auth_router)
app.include_router(cv_router)
app.include_router(application_router)
app.include_router(stats_router)

@app.get("/")
def root():
    return {"message": "LifeBoard API is running"}