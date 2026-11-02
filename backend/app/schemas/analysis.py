from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.schemas.llm import StructuredLLMReport

class PredictionItem(BaseModel):
    feature_name: str
    predicted_label: str
    confidence: float
    details: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class AnalysisResponse(BaseModel):
    id: int
    image_id: int
    model_version: str
    analysis_status: str
    image_quality: str = "Pending"
    quality_details: Optional[Dict[str, Any]] = None
    processed_image_url: Optional[str] = None
    mask_image_url: Optional[str] = None
    gradcam_image_url: Optional[str] = None
    overlay_image_url: Optional[str] = None
    original_image_url: Optional[str] = None
    predictions: List[PredictionItem] = []
    created_at: datetime
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class AnalysisDetailResponse(AnalysisResponse):
    report: Optional[StructuredLLMReport] = None
    language: str = "en"
    pdf_download_url: Optional[str] = None
