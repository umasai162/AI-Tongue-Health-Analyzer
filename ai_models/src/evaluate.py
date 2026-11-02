import os
import sys
import argparse
from pathlib import Path
import numpy as np
import cv2
import torch

# Ensure project root and backend are in path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(ROOT_DIR / "backend") not in sys.path:
    sys.path.insert(0, str(ROOT_DIR / "backend"))

from app.services.segmentation_service import segmentation_service
from app.services.classification_service import classification_service
from ai_models.src.segmentation import UNet
from ai_models.src.multitask_model import MultiTaskTongueClassifier

# Canonical clinical reference benchmark labels
BENCHMARK_GROUND_TRUTH = {
    "normal_pink": {
        "Tongue Color": "Normal Pink",
        "Tongue Coating": "Thin White (Normal)",
        "Surface Texture": "Smooth/Normal",
        "Tongue Shape": "Normal",
        "Fissures": "Absent",
        "Teeth Marks": "Absent",
        "Visible Patches": "None/Uniform"
    },
    "coated_white": {
        "Tongue Color": "Normal Pink",
        "Tongue Coating": "Thick White",
        "Surface Texture": "Smooth/Normal",
        "Tongue Shape": "Normal",
        "Fissures": "Absent",
        "Teeth Marks": "Absent",
        "Visible Patches": "None/Uniform"
    },
    "fissured_tongue": {
        "Tongue Color": "Deep Red",
        "Tongue Coating": "Peeled/None",
        "Surface Texture": "Fissured",
        "Tongue Shape": "Normal",
        "Fissures": "Deep/Severe",
        "Teeth Marks": "Absent",
        "Visible Patches": "Erythematous Spots"
    },
    "scalloped_edges": {
        "Tongue Color": "Normal Pink",
        "Tongue Coating": "Thin White (Normal)",
        "Surface Texture": "Smooth/Normal",
        "Tongue Shape": "Swollen/Enlarged",
        "Fissures": "Absent",
        "Teeth Marks": "Present (Scalloped)",
        "Visible Patches": "None/Uniform"
    }
}

def evaluate_models(checkpoint_dir="./ai_models/checkpoints", samples_dir="frontend/public/samples", output_dir="./output"):
    """
    Comprehensive evaluation pipeline for tongue segmentation and multi-task feature classification.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("=" * 70)
    print("       AI TONGUE HEALTH ANALYZER - MODEL EVALUATION PIPELINE")
    print("=" * 70)
    print(f"Device: {device}")
    print(f"Checkpoint Directory: {checkpoint_dir}")
    print(f"Samples Directory: {samples_dir}")
    print("-" * 70)

    # 1. Neural Checkpoint Verification
    unet_path = os.path.join(checkpoint_dir, "unet_tongue.pth")
    if os.path.exists(unet_path):
        print(f"[Segmentation Checkpoint] Found trained U-Net: {unet_path}")
        try:
            unet_model = UNet(n_channels=3, n_classes=1).to(device)
            unet_model.load_state_dict(torch.load(unet_path, map_location=device))
            unet_model.eval()
            print("  -> U-Net architecture verified and weights loaded successfully.")
        except Exception as e:
            print(f"  -> Warning loading U-Net checkpoint: {e}")
    else:
        print(f"[Segmentation Checkpoint] Awaiting dataset training (Using Active Saliency Fallback)")

    clf_path = os.path.join(checkpoint_dir, "multitask_efficientnetv2.pth")
    if os.path.exists(clf_path):
        print(f"[Classification Checkpoint] Found MultiTask EfficientNetV2: {clf_path}")
        try:
            clf_model = MultiTaskTongueClassifier(pretrained=False).to(device)
            clf_model.load_state_dict(torch.load(clf_path, map_location=device))
            clf_model.eval()
            print("  -> EfficientNetV2 multi-task architecture and heads verified.")
        except Exception as e:
            print(f"  -> Warning loading EfficientNetV2 checkpoint: {e}")
    else:
        print(f"[Classification Checkpoint] Awaiting dataset training (Using Calibrated CV Pipeline)")

    print("\n" + "=" * 70)
    print("       RUNNING CLINICAL PREDICTION EVALUATION ON TEST SAMPLES")
    print("=" * 70)

    os.makedirs(output_dir, exist_ok=True)
    sample_files = list(Path(samples_dir).glob("*.jpg")) + list(Path(samples_dir).glob("*.png")) + list(Path(samples_dir).glob("*.webp"))
    if not sample_files:
        print(f"No sample images found in {samples_dir}.")
        return

    total_checks = 0
    correct_checks = 0
    per_feature_stats = {}

    for sample_path in sample_files:
        stem = sample_path.stem
        name = sample_path.name
        mask_path = os.path.join(output_dir, f"eval_{stem}_mask.png")
        overlay_path = os.path.join(output_dir, f"eval_{stem}_overlay.png")

        print(f"\nEvaluating: {name}")
        seg_res = segmentation_service.execute_segmentation(str(sample_path), mask_path, overlay_path)
        clf_res = classification_service.classify_image(str(sample_path), mask_path)

        print(f"  Segmentation: Area = {seg_res['tongue_area_percentage']}%, Model = {seg_res['model_version']}")
        print(f"  Classification Model: {clf_res['model_version']}")

        gt = BENCHMARK_GROUND_TRUTH.get(stem)
        print(f"  {'Feature':<20} | {'Predicted Label':<22} | {'Confidence':<10} | {'Status'}")
        print("  " + "-" * 66)

        for pred in clf_res["predictions"]:
            feat = pred["feature_name"]
            label = pred["predicted_label"]
            conf = pred["confidence"]

            if feat not in per_feature_stats:
                per_feature_stats[feat] = {"total": 0, "correct": 0}

            status_str = "N/A"
            if gt and feat in gt:
                per_feature_stats[feat]["total"] += 1
                total_checks += 1
                expected = gt[feat]
                if label == expected:
                    per_feature_stats[feat]["correct"] += 1
                    correct_checks += 1
                    status_str = "MATCH [OK]"
                else:
                    status_str = f"MISMATCH (Expected: {expected})"

            print(f"  {feat:<20} | {label:<22} | {conf*100:>8.1f}% | {status_str}")

    print("\n" + "=" * 70)
    print("                 PER-FEATURE EVALUATION SUMMARY")
    print("=" * 70)
    for feat, stats in per_feature_stats.items():
        if stats["total"] > 0:
            acc = (stats["correct"] / stats["total"]) * 100
            print(f"  {feat:<20}: {stats['correct']}/{stats['total']} accurate ({acc:.1f}%)")

    if total_checks > 0:
        overall_acc = (correct_checks / total_checks) * 100
        print("-" * 70)
        print(f"  OVERALL PREDICTION ACCURACY: {correct_checks}/{total_checks} ({overall_acc:.1f}%)")
        print("=" * 70)
    else:
        print("\nEvaluation completed across test images (No ground truth annotations mapped).")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate Tongue Health Prediction Pipeline")
    parser.add_argument("--samples_dir", default="frontend/public/samples", help="Path to evaluation test images")
    parser.add_argument("--checkpoint_dir", default="./ai_models/checkpoints", help="Path to neural model checkpoints")
    parser.add_argument("--output_dir", default="./output", help="Directory to save evaluation masks/overlays")
    args = parser.parse_args()

    evaluate_models(args.checkpoint_dir, args.samples_dir, args.output_dir)
