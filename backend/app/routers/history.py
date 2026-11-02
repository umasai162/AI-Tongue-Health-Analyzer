import os
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.image import TongueImage
from app.models.analysis import Analysis
from app.utils.security import get_current_user
from app.config import settings

router = APIRouter(prefix="/api/history", tags=["Analysis History"])

@router.get("", response_model=List[Dict[str, Any]])
def get_user_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full chronological analysis history for the current user."""
    analyses = db.query(Analysis).join(TongueImage).filter(
        TongueImage.user_id == current_user.id
    ).order_by(Analysis.created_at.desc()).all()

    history_items = []
    for a in analyses:
        pred_dict = {p.feature_name: p.predicted_label for p in a.predictions}
        history_items.append({
            "analysis_id": a.id,
            "image_id": a.image_id,
            "created_at": a.created_at,
            "status": a.analysis_status,
            "model_version": a.model_version,
            "thumbnail_url": f"/uploads/{a.overlay_image_path or a.image.image_path}",
            "original_image_url": f"/uploads/{a.image.image_path}",
            "features_summary": {
                "color": pred_dict.get("Tongue Color", "N/A"),
                "coating": pred_dict.get("Tongue Coating", "N/A"),
                "texture": pred_dict.get("Surface Texture", "N/A"),
                "shape": pred_dict.get("Tongue Shape", "N/A")
            },
            "has_report": len(a.reports) > 0
        })

    return history_items

@router.delete("/{analysis_id}", status_code=status.HTTP_200_OK)
def delete_history_item(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an analysis record and its generated artifact images."""
    analysis = db.query(Analysis).join(TongueImage).filter(
        Analysis.id == analysis_id,
        TongueImage.user_id == current_user.id
    ).first()

    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis record not found.")

    # Remove generated artifacts from disk if they exist
    for filename in [
        analysis.processed_image_path,
        analysis.mask_image_path,
        analysis.overlay_image_path,
        analysis.gradcam_image_path
    ]:
        if filename:
            file_path = os.path.join(settings.UPLOAD_DIR, filename)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception:
                    pass

    db.delete(analysis)
    db.commit()
    return {"message": f"Analysis #{analysis_id} has been permanently deleted."}
