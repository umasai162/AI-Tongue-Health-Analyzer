from pydantic import BaseModel, Field
from typing import List, Optional

class StructuredLLMReport(BaseModel):
    summary: str = Field(..., description="Educational summary of the tongue features observed.")
    visible_observations: List[str] = Field(..., description="List of observed physical tongue characteristics.")
    general_explanations: List[str] = Field(..., description="General educational explanations of what these visual characteristics typically signify.")
    evidence_references: List[str] = Field(..., description="Citations to medical literature and anatomical sources.")
    recommended_next_steps: List[str] = Field(..., description="General oral hygiene and wellness suggestions.")
    when_to_consult_doctor: List[str] = Field(..., description="Specific signs or symptoms that warrant professional medical evaluation.")
    limitations: List[str] = Field(..., description="Explicit limitations of visual AI analysis vs clinical examination.")
    medical_disclaimer: str = Field(..., description="Mandatory non-diagnostic legal and medical safety disclaimer.")

class ReportResponse(BaseModel):
    id: int
    analysis_id: int
    summary: str
    report_data: StructuredLLMReport
    language: str
    pdf_url: Optional[str] = None
