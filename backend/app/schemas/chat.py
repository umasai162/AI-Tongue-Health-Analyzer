from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    analysis_id: Optional[int] = None
    language: Optional[str] = "en"  # "en" or "te"
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    response: str
    language: str
    retrieved_sources: List[str] = []
    medical_disclaimer: str
