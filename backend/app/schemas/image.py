from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class ImageQualityAssessment(BaseModel):
    is_acceptable: bool
    status: str  # "Good", "Blurry", "Dark", "Overexposed", "Low Resolution", "Tongue Not Detected"
    brightness_score: float
    blur_score: float
    color_distribution: Dict[str, float]
    recommendation: Optional[str] = None

class TongueImageResponse(BaseModel):
    id: int
    user_id: int
    image_url: str
    original_filename: Optional[str]
    upload_date: datetime
    image_quality: str
    quality_details: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)

class ImageUploadResponse(BaseModel):
    image_id: int
    image_url: str
    quality_assessment: ImageQualityAssessment
    message: str
