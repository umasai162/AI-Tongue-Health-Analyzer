import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class LLMReport(Base):
    __tablename__ = "llm_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    summary = Column(Text, nullable=False)
    report_json = Column(Text, nullable=False)  # Stores JSON structure
    language = Column(String(20), default="en", nullable=False)  # en, te
    pdf_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    analysis = relationship("Analysis", back_populates="reports")
