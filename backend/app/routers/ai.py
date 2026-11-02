import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.image import TongueImage
from app.models.analysis import Analysis, Prediction
from app.models.report import LLMReport
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.llm import ReportResponse, StructuredLLMReport
from app.utils.security import get_current_user
from app.services.llm_service import llm_service
from app.services.pdf_service import pdf_service
from app.config import settings

router = APIRouter(prefix="/api/ai", tags=["AI & RAG Services"])

@router.post("/insights/{analysis_id}", response_model=ReportResponse)
def regenerate_insights(
    analysis_id: int,
    language: str = "en",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Re-generate structured LLM health insights in a chosen language (e.g., 'en' or 'te').
    """
    analysis = db.query(Analysis).join(TongueImage).filter(
        Analysis.id == analysis_id,
        TongueImage.user_id == current_user.id
    ).first()

    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis record not found.")

    predictions = db.query(Prediction).filter(Prediction.analysis_id == analysis.id).all()
    predictions_data = [
        {"feature_name": p.feature_name, "predicted_label": p.predicted_label, "confidence": p.confidence, "details": p.details}
        for p in predictions
    ]

    obs_dict = {
        "image_quality": analysis.image.image_quality,
        "tongue_color": next((p["predicted_label"] for p in predictions_data if "Color" in p["feature_name"]), "Normal Pink"),
        "coating": next((p["predicted_label"] for p in predictions_data if "Coating" in p["feature_name"]), "Thin White"),
        "texture": next((p["predicted_label"] for p in predictions_data if "Texture" in p["feature_name"]), "Smooth"),
        "fissures": next((p["predicted_label"] for p in predictions_data if "Fissures" in p["feature_name"]), "Absent"),
        "teeth_marks": next((p["predicted_label"] for p in predictions_data if "Teeth" in p["feature_name"]), "Absent"),
        "patches": next((p["predicted_label"] for p in predictions_data if "Patches" in p["feature_name"]), "None"),
        "confidence": {
            "color": next((p["confidence"] for p in predictions_data if "Color" in p["feature_name"]), 0.9),
            "coating": next((p["confidence"] for p in predictions_data if "Coating" in p["feature_name"]), 0.9)
        }
    }

    report_data = llm_service.generate_health_report(obs_dict, language=language)

    # Re-generate PDF with chosen language
    pdf_filename = f"report_analysis_{analysis.id}_{language}.pdf"
    image_dict = {
        "original": str(settings.UPLOAD_DIR) + "/" + analysis.image.image_path,
        "processed": str(settings.UPLOAD_DIR) + "/" + (analysis.processed_image_path or analysis.image.image_path),
        "mask": str(settings.UPLOAD_DIR) + "/" + (analysis.mask_image_path or analysis.image.image_path),
        "gradcam": str(settings.UPLOAD_DIR) + "/" + (analysis.gradcam_image_path or analysis.image.image_path)
    }
    pdf_service.generate_report_pdf(
        analysis_id=analysis.id,
        user_name=current_user.name,
        user_email=current_user.email,
        created_at_str=analysis.created_at.strftime("%Y-%m-%d %H:%M UTC"),
        image_paths=image_dict,
        predictions=predictions_data,
        report_data=report_data,
        output_filename=pdf_filename
    )

    # Save or update report record
    existing_report = db.query(LLMReport).filter(LLMReport.analysis_id == analysis.id).first()
    if existing_report:
        existing_report.summary = report_data["summary"]
        existing_report.report_json = json.dumps(report_data)
        existing_report.language = language
        existing_report.pdf_path = pdf_filename
        report_obj = existing_report
    else:
        report_obj = LLMReport(
            analysis_id=analysis.id,
            summary=report_data["summary"],
            report_json=json.dumps(report_data),
            language=language,
            pdf_path=pdf_filename
        )
        db.add(report_obj)
    db.commit()
    db.refresh(report_obj)

    return {
        "id": report_obj.id,
        "analysis_id": analysis.id,
        "summary": report_obj.summary,
        "report_data": StructuredLLMReport(**report_data),
        "language": language,
        "pdf_url": f"/api/reports/{analysis.id}/download"
    }

@router.post("/chat", response_model=ChatResponse)
def health_chat(
    chat_req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Conversational AI Chatbot grounded in medical literature and user's analysis context.
    Answers user queries in English or Telugu while strictly avoiding disease diagnosis.
    """
    analysis_context = "No specific analysis selected. General oral health query."
    if chat_req.analysis_id:
        analysis = db.query(Analysis).join(TongueImage).filter(
            Analysis.id == chat_req.analysis_id,
            TongueImage.user_id == current_user.id
        ).first()
        if analysis:
            preds = [f"{p.feature_name}: {p.predicted_label} (Confidence: {p.confidence})" for p in analysis.predictions]
            analysis_context = f"User Analysis ID #{analysis.id} Observations:\n" + "\n".join(preds)

    response_data = llm_service.chat_response(
        user_msg=chat_req.message,
        analysis_context=analysis_context,
        history=chat_req.history or [],
        language=chat_req.language or "en"
    )
    return response_data
