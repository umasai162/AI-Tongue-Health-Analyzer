import sys
import os
import argparse
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(ROOT_DIR / "backend"))

from app.services.preprocessing import ImagePreprocessor
from app.services.segmentation_service import segmentation_service
from app.services.classification_service import classification_service
from app.services.gradcam_service import gradcam_service

def predict_single_image(image_path: str, output_dir: str = "./output"):
    os.makedirs(output_dir, exist_ok=True)
    stem = Path(image_path).stem

    proc_path = os.path.join(output_dir, f"{stem}_processed.png")
    mask_path = os.path.join(output_dir, f"{stem}_mask.png")
    overlay_path = os.path.join(output_dir, f"{stem}_overlay.png")
    gradcam_path = os.path.join(output_dir, f"{stem}_gradcam.png")

    print(f"1. Loading & Preprocessing: {image_path}")
    proc_img, quality = ImagePreprocessor.preprocess_pipeline(image_path, proc_path)
    print(f"   Quality: {quality['status']} (Blur: {quality['blur_score']}, Lightness: {quality['brightness_score']})")

    print("2. Running Tongue Segmentation...")
    seg = segmentation_service.execute_segmentation(image_path, mask_path, overlay_path)
    print(f"   Model: {seg['model_version']}, Tongue Area: {seg['tongue_area_percentage']}%")

    print("3. Running Multi-Task Classification...")
    clf = classification_service.classify_image(image_path, mask_path)
    print(f"   Model: {clf['model_version']}")
    for p in clf["predictions"]:
        print(f"   - {p['feature_name']}: {p['predicted_label']} (Conf: {int(p['confidence']*100)}%)")

    print("4. Generating Grad-CAM XAI Heatmap...")
    import cv2
    mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
    gradcam_service.generate_roi_cam(proc_img, mask, gradcam_path)
    print(f"   Grad-CAM saved to: {gradcam_path}")
    print("Inference Pipeline Complete!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tongue Image Single Inference")
    parser.add_argument("image_path", help="Path to input tongue image")
    parser.add_argument("--output_dir", default="./output", help="Directory to save output visualizations")
    args = parser.parse_args()
    predict_single_image(args.image_path, args.output_dir)
