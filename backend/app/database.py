import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger(__name__)

DATABASE_URL = settings.DATABASE_URL

def create_active_engine():
    """
    Attempt to connect using primary DATABASE_URL (MySQL).
    Fallback gracefully to SQLite if MySQL service or credentials are not yet ready.
    """
    try:
        # If MySQL URL, test connection
        if "mysql" in DATABASE_URL:
            # First try testing connection
            test_engine = create_engine(
                DATABASE_URL,
                pool_pre_ping=True,
                pool_recycle=3600,
                connect_args={"connect_timeout": 3}
            )
            with test_engine.connect() as conn:
                logger.info("Successfully connected to MySQL database: %s", DATABASE_URL.split("@")[-1])
            return test_engine
        else:
            return create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
    except Exception as e:
        logger.warning(
            "Primary database connection to MySQL failed (%s). Falling back gracefully to SQLite database (%s) for seamless operation.",
            str(e),
            settings.SQLITE_FALLBACK_URL
        )
        return create_engine(
            settings.SQLITE_FALLBACK_URL,
            connect_args={"check_same_thread": False}
        )

engine = create_active_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
