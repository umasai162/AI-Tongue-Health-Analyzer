import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class TongueImage(Base):
    __tablename__ = "tongue_images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    image_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=True)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    image_quality = Column(String(50), default="Pending", nullable=False)
    quality_details = Column(Text, nullable=True)

    user = relationship("User", back_populates="images")
    analyses = relationship("Analysis", back_populates="image", cascade="all, delete-orphan")
