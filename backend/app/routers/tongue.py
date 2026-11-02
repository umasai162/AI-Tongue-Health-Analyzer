import os
import uuid
import json
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.image import TongueImage
from app.models.analysis import Analysis, Prediction
from app.models.report import LLMReport
from app.schemas.image import ImageUploadResponse, TongueImageResponse, ImageQualityAssessment
from app.schemas.analysis import AnalysisResponse, AnalysisDetailResponse
from app.schemas.llm import StructuredLLMReport
from app.utils.security import get_current_user
from app.services.preprocessing import ImagePreprocessor
from app.services.segmentation_service import segmentation_service
from app.services.classification_service import classification_service
from app.services.gradcam_service import gradcam_service
from app.services.llm_service import llm_service
from app.services.pdf_service import pdf_service

router = APIRouter(prefix="/api/tongue", tags=["Tongue Image & Analysis"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

@router.post("/upload", response_model=ImageUploadResponse)
async def upload_tongue_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload and validate a tongue image:
    Checks format, file size, blurriness, and brightness.
    """
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format '{ext}'. Allowed formats: JPG, JPEG, PNG, WEBP."
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 10 MB limit."
        )

    unique_id = uuid.uuid4().hex[:12]
    filename = f"{unique_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Computer Vision Quality Check
    try:
        img_np = ImagePreprocessor.load_image(file_path)
        quality_eval = ImagePreprocessor.assess_quality(img_np)
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image validation failed: {str(e)}"
        )

    tongue_image = TongueImage(
        user_id=current_user.id,
        image_path=filename,
        original_filename=file.filename,
        image_quality=quality_eval["status"],
        quality_details=json.dumps(quality_eval)
    )
    db.add(tongue_image)
    db.commit()
    db.refresh(tongue_image)

    return {
        "image_id": tongue_image.id,
        "image_url": f"/uploads/{filename}",
        "quality_assessment": ImageQualityAssessment(**quality_eval),
        "message": "Image successfully uploaded and evaluated."
    }

@router.get("/images", response_model=List[TongueImageResponse])
def get_user_images(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all uploaded images belonging to the authenticated user."""
    images = db.query(TongueImage).filter(TongueImage.user_id == current_user.id).order_by(TongueImage.upload_date.desc()).all()
    results = []
    for img in images:
        results.append({
            "id": img.id,
            "user_id": img.user_id,
            "image_url": f"/uploads/{img.image_path}",
            "original_filename": img.original_filename,
            "upload_date": img.upload_date,
            "image_quality": img.image_quality,
            "quality_details": json.loads(img.quality_details) if img.quality_details else None
        })
    return results

@router.post("/analyze/{image_id}", response_model=AnalysisDetailResponse)
def run_tongue_analysis(
    image_id: int,
    language: str = "en",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Execute full Computer Vision & Deep Learning Analysis pipeline:
    1. Preprocessing (CLAHE illumination correction, denoising)
    2. U-Net / Saliency Segmentation (mask & overlay)
    3. Multi-task Classification (Color, Coating, Texture, Shape, Fissures, Teeth Marks, Patches)
    4. Grad-CAM Explainable AI Heatmap
    5. Gemini LLM Structured Health Insights with RAG grounding
    6. PDF Report Compilation
    """
    image_record = db.query(TongueImage).filter(
        TongueImage.id == image_id,
        TongueImage.user_id == current_user.id
    ).first()

    if not image_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tongue image not found.")

    raw_img_path = os.path.join(settings.UPLOAD_DIR, image_record.image_path)
    if not os.path.exists(raw_img_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image file missing from server storage.")

    # Generate filenames for analysis artifacts
    stem = Path(image_record.image_path).stem
    processed_filename = f"{stem}_processed.png"
    mask_filename = f"{stem}_mask.png"
    overlay_filename = f"{stem}_overlay.png"
    gradcam_filename = f"{stem}_gradcam.png"
    pdf_filename = f"report_analysis_{image_id}_{stem}.pdf"

    proc_path = os.path.join(settings.UPLOAD_DIR, processed_filename)
    mask_path = os.path.join(settings.UPLOAD_DIR, mask_filename)
    overlay_path = os.path.join(settings.UPLOAD_DIR, overlay_filename)
    gradcam_path = os.path.join(settings.UPLOAD_DIR, gradcam_filename)

    # Create analysis DB entry
    analysis = Analysis(
        image_id=image_record.id,
        model_version="EfficientNetV2-S + U-Net (v1.0)",
        analysis_status="processing"
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    try:
        # Step 1: Preprocessing
        proc_img, quality_report = ImagePreprocessor.preprocess_pipeline(raw_img_path, proc_path)

        # Step 2: Tongue Segmentation
        seg_result = segmentation_service.execute_segmentation(raw_img_path, mask_path, overlay_path)

        # Step 3: Multi-task Classification
        clf_result = classification_service.classify_image(raw_img_path, mask_path)
        predictions_data = clf_result["predictions"]

        # Step 4: Grad-CAM Explainability
        gradcam_service.generate_roi_cam(proc_img, cv2_mask_imread(mask_path), gradcam_path)

        # Update Analysis record
        analysis.processed_image_path = processed_filename
        analysis.mask_image_path = mask_filename
        analysis.overlay_image_path = overlay_filename
        analysis.gradcam_image_path = gradcam_filename
        analysis.model_version = f"{clf_result['model_version']} / {seg_result['model_version']}"
        analysis.analysis_status = "completed"

        # Save predictions in DB
        pred_objs = []
        for p in predictions_data:
            pred_obj = Prediction(
                analysis_id=analysis.id,
                feature_name=p["feature_name"],
                predicted_label=p["predicted_label"],
                confidence=p["confidence"],
                details=p.get("details", "")
            )
            db.add(pred_obj)
            pred_objs.append(pred_obj)
        db.commit()

        # Step 5: LLM Structured Health Insights
        obs_dict = {
            "image_quality": image_record.image_quality,
            "tongue_color": next((p["predicted_label"] for p in predictions_data if "Color" in p["feature_name"]), "Pink"),
            "coating": next((p["predicted_label"] for p in predictions_data if "Coating" in p["feature_name"]), "Thin White"),
            "texture": next((p["predicted_label"] for p in predictions_data if "Texture" in p["feature_name"]), "Normal"),
            "fissures": next((p["predicted_label"] for p in predictions_data if "Fissures" in p["feature_name"]), "Absent"),
            "teeth_marks": next((p["predicted_label"] for p in predictions_data if "Teeth" in p["feature_name"]), "Absent"),
            "patches": next((p["predicted_label"] for p in predictions_data if "Patches" in p["feature_name"]), "None"),
            "confidence": {
                "color": next((p["confidence"] for p in predictions_data if "Color" in p["feature_name"]), 0.9),
                "coating": next((p["confidence"] for p in predictions_data if "Coating" in p["feature_name"]), 0.9)
            }
        }
        structured_report = llm_service.generate_health_report(obs_dict, language=language)

        # Step 6: Generate PDF Report
        image_dict = {
            "original": raw_img_path,
            "processed": proc_path,
            "mask": mask_path,
            "gradcam": gradcam_path
        }
        pdf_service.generate_report_pdf(
            analysis_id=analysis.id,
            user_name=current_user.name,
            user_email=current_user.email,
            created_at_str=analysis.created_at.strftime("%Y-%m-%d %H:%M UTC"),
            image_paths=image_dict,
            predictions=predictions_data,
            report_data=structured_report,
            output_filename=pdf_filename
        )

        # Store report in DB
        report_record = LLMReport(
            analysis_id=analysis.id,
            summary=structured_report["summary"],
            report_json=json.dumps(structured_report),
            language=language,
            pdf_path=pdf_filename
        )
        db.add(report_record)
        db.commit()
        db.refresh(analysis)

        return format_analysis_detail(analysis, current_user, image_record, structured_report, language, pdf_filename)

    except Exception as e:
        analysis.analysis_status = "failed"
        analysis.error_message = str(e)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis pipeline error: {str(e)}"
        )

def cv2_mask_imread(path):
    import cv2
    return cv2.imread(path, cv2.IMREAD_GRAYSCALE)

@router.get("/result/{analysis_id}", response_model=AnalysisDetailResponse)
def get_analysis_result(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full analysis report and feature breakdown."""
    analysis = db.query(Analysis).join(TongueImage).filter(
        Analysis.id == analysis_id,
        TongueImage.user_id == current_user.id
    ).first()

    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis result not found.")

    report = db.query(LLMReport).filter(LLMReport.analysis_id == analysis.id).first()
    report_dict = json.loads(report.report_json) if report else None
    language = report.language if report else "en"
    pdf_filename = report.pdf_path if report else None

    return format_analysis_detail(analysis, current_user, analysis.image, report_dict, language, pdf_filename)

def format_analysis_detail(analysis, user, image_record, report_dict, language, pdf_filename):
    predictions_list = [
        {
            "feature_name": p.feature_name,
            "predicted_label": p.predicted_label,
            "confidence": p.confidence,
            "details": p.details
        }
        for p in analysis.predictions
    ]

    quality_details = None
    if getattr(image_record, "quality_details", None):
        try:
            quality_details = json.loads(image_record.quality_details)
        except (TypeError, ValueError):
            quality_details = None

    return {
        "id": analysis.id,
        "image_id": analysis.image_id,
        "model_version": analysis.model_version,
        "analysis_status": analysis.analysis_status,
        "image_quality": image_record.image_quality,
        "quality_details": quality_details,
        "original_image_url": f"/uploads/{image_record.image_path}",
        "processed_image_url": f"/uploads/{analysis.processed_image_path}" if analysis.processed_image_path else None,
        "mask_image_url": f"/uploads/{analysis.mask_image_path}" if analysis.mask_image_path else None,
        "overlay_image_url": f"/uploads/{analysis.overlay_image_path}" if analysis.overlay_image_path else None,
        "gradcam_image_url": f"/uploads/{analysis.gradcam_image_path}" if analysis.gradcam_image_path else None,
        "predictions": predictions_list,
        "created_at": analysis.created_at,
        "error_message": analysis.error_message,
        "report": StructuredLLMReport(**report_dict) if report_dict else None,
        "language": language,
        "pdf_download_url": f"/api/reports/{analysis.id}/download" if pdf_filename else None
    }
