import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    consent_type = Column(String(100), nullable=False)  # e.g., 'educational_disclaimer', 'image_retention', 'privacy_policy'
    granted = Column(Boolean, default=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="consents")
