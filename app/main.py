from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import Base, engine


from app.routers.auth import router as auth_router
from app.routers.applications import router as application_router
from app.routers.interviews import router as interview_router
from app.routers.notes import router as note_router
from app.routers.followups import router as followup_router
from app.routers.dashboard import router as dashboard_router


Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(application_router)
app.include_router(interview_router)
app.include_router(note_router)
app.include_router(followup_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {"message": "Job Application Tracker API"}