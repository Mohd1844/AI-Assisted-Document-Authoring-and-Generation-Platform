from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth_router, project_router, generate_router, export_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Document Platform")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router.router)
app.include_router(project_router.router)
app.include_router(generate_router.router)
app.include_router(export_router.router)

@app.get("/")
def root():
    return {"message": "AI Document Platform API"}
