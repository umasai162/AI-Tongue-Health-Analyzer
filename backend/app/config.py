import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Tongue Health Analyzer"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # Database
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/tongue_db"
    SQLITE_FALLBACK_URL: str = f"sqlite:///{(BASE_DIR / 'tongue_health.db').as_posix()}"

    # Security / JWT
    SECRET_KEY: str = "tongue-analyzer-super-secret-key-production-ready-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # AI & LLM
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Storage paths
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    REPORTS_DIR: str = str(BASE_DIR / "generated_reports")
    MODELS_DIR: str = str(BASE_DIR.parent / "ai_models" / "checkpoints")
    VECTOR_DB_DIR: str = str(BASE_DIR.parent / "knowledge_base" / "vector_db")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        extra="allow"
    )

settings = Settings()

# Ensure runtime directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)
os.makedirs(settings.MODELS_DIR, exist_ok=True)
os.makedirs(settings.VECTOR_DB_DIR, exist_ok=True)
