import os
import sys
import glob
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR / "backend") not in sys.path:
    sys.path.insert(0, str(ROOT_DIR / "backend"))

from app.services.segmentation_service import segmentation_service
from app.services.classification_service import classification_service

def test_samples(sample_dir="frontend/public/samples"):
    files = sorted(glob.glob(os.path.join(sample_dir, "*.jpg")))
    print(f"=== TESTING FEATURE EXTRACTION PIPELINE ({len(files)} samples) ===")
    
    for p in files:
        mask_tmp = "tmp_mask.png"
        overlay_tmp = "tmp_over.png"
        
        seg = segmentation_service.execute_segmentation(p, mask_tmp, overlay_tmp)
        clf = classification_service.classify_image(p, mask_tmp)
        
        print(f"\nImage: {os.path.basename(p)} (Area: {seg['tongue_area_percentage']}%)")
        for pred in clf["predictions"]:
            print(f"  {pred['feature_name']}: {pred['predicted_label']} (conf: {int(pred['confidence']*100)}%)")
            
        if os.path.exists(mask_tmp):
            os.remove(mask_tmp)
        if os.path.exists(overlay_tmp):
            os.remove(overlay_tmp)

if __name__ == "__main__":
    test_samples()
