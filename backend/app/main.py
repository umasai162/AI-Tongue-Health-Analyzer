import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
import app.models  # Ensures models are imported for metadata creation
from app.routers import auth, tongue, ai, history, reports

# Create database tables if they do not exist
try:
    Base.metadata.create_all(bind=engine)
    print("Database schema successfully verified/initialized.")
except Exception as e:
    print(f"Database schema initialization warning: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Educational AI Tongue Health Analyzer powered by Computer Vision, Multi-Task PyTorch, Grad-CAM, RAG, and Gemini LLM."
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static directory for image serving
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(tongue.router)
app.include_router(ai.router)
app.include_router(history.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "description": "Production-oriented Educational AI Tongue Health Analyzer API",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database": str(engine.url).split("@")[-1] if "@" in str(engine.url) else "active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
