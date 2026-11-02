import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    image_id = Column(Integer, ForeignKey("tongue_images.id", ondelete="CASCADE"), nullable=False, index=True)
    model_version = Column(String(100), default="efficientnetv2-unet-v1.0", nullable=False)
    analysis_status = Column(String(50), default="processing", nullable=False)  # processing, completed, failed
    processed_image_path = Column(String(500), nullable=True)
    mask_image_path = Column(String(500), nullable=True)
    gradcam_image_path = Column(String(500), nullable=True)
    overlay_image_path = Column(String(500), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    image = relationship("TongueImage", back_populates="analyses")
    predictions = relationship("Prediction", back_populates="analysis", cascade="all, delete-orphan")
    reports = relationship("LLMReport", back_populates="analysis", cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    feature_name = Column(String(100), nullable=False)  # color, coating, texture, shape, fissures, teeth_marks, visible_patches
    predicted_label = Column(String(150), nullable=False)
    confidence = Column(Float, nullable=False)
    details = Column(Text, nullable=True)

    analysis = relationship("Analysis", back_populates="predictions")
