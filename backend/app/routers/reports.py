import os
import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.image import TongueImage
from app.models.analysis import Analysis
from app.models.report import LLMReport
from app.schemas.llm import StructuredLLMReport
from app.utils.security import get_current_user
from app.config import settings

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/{analysis_id}")
def get_report_json(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve structured LLM health report for an analysis."""
    analysis = db.query(Analysis).join(TongueImage).filter(
        Analysis.id == analysis_id,
        TongueImage.user_id == current_user.id
    ).first()

    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found.")

    report = db.query(LLMReport).filter(LLMReport.analysis_id == analysis.id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report has not been generated for this analysis.")

    return {
        "analysis_id": analysis.id,
        "language": report.language,
        "summary": report.summary,
        "report_data": json.loads(report.report_json),
        "created_at": report.created_at
    }

@router.get("/{analysis_id}/download")
def download_pdf_report(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download the compiled educational PDF report."""
    analysis = db.query(Analysis).join(TongueImage).filter(
        Analysis.id == analysis_id,
        TongueImage.user_id == current_user.id
    ).first()

    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found.")

    report = db.query(LLMReport).filter(LLMReport.analysis_id == analysis.id).first()
    if not report or not report.pdf_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF report file not found.")

    pdf_full_path = os.path.join(settings.REPORTS_DIR, report.pdf_path)
    if not os.path.exists(pdf_full_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF file missing from storage.")

    return FileResponse(
        path=pdf_full_path,
        media_type="application/pdf",
        filename=f"Tongue_Health_Report_{analysis_id}.pdf"
    )
