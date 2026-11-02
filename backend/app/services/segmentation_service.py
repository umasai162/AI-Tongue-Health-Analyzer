import os
import cv2
import numpy as np
import torch
from pathlib import Path
from typing import Tuple, Dict, Any, Optional

from app.config import settings

class TongueSegmentationService:
    """
    Tongue Segmentation Inference Service.
    Supports deep learning PyTorch U-Net checkpoint inference,
    with an advanced morphological color-saliency fallback when
    weights are awaiting training.
    """

    def __init__(self):
        self.checkpoint_path = Path(settings.MODELS_DIR) / "unet_tongue.pth"
        self.model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._load_model_if_available()

    def _load_model_if_available(self):
        if self.checkpoint_path.exists():
            try:
                from ai_models.src.segmentation import UNet
                self.model = UNet(n_channels=3, n_classes=1)
                state_dict = torch.load(self.checkpoint_path, map_location=self.device)
                self.model.load_state_dict(state_dict)
                self.model.to(self.device)
                self.model.eval()
            except Exception as e:
                self.model = None

    def segment_cv_fallback(self, image: np.ndarray) -> np.ndarray:
        """
        Anatomical saliency and morphological segmentation fallback.
        Identifies the primary oral/lingual ROI using CIE LAB and HSV color cues,
        effectively excluding dark oral cavities and facial lips while preserving
        lateral margin geometry (critical for teeth-mark scalloping detection).
        """
        h, w = image.shape[:2]

        # 1. Convert to HSV and LAB color spaces
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)

        l_channel = lab[:, :, 0]
        a_channel = lab[:, :, 1]
        b_channel = lab[:, :, 2]

        # 2. Extract lingual mucosa & coating while excluding dark oral background (L < 50)
        # Red/Pink mucosa
        mask_mucosa = (l_channel > 50) & (a_channel > 133)

        # White/cream dorsal coating (high lightness, low saturation)
        mask_coating = (l_channel > 105) & (hsv[:, :, 1] < 100) & (a_channel > 125)

        # Yellowish coating (warm b-channel with yellow HSV hue 15-45)
        mask_yellow = (l_channel > 75) & (b_channel > 146) & (hsv[:, :, 0] > 15) & (hsv[:, :, 0] < 45)

        combined = (mask_mucosa | mask_coating | mask_yellow).astype(np.uint8) * 255

        # 3. Morphological cleanup: modest kernel preserves fine lateral scallop indentations
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        cleaned = cv2.morphologyEx(combined, cv2.MORPH_CLOSE, kernel)
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel)

        # 4. Find largest connected contour representing the lingual body
        contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        mask = np.zeros((h, w), dtype=np.uint8)

        if contours:
            min_area = (h * w) * 0.03
            valid_contours = [c for c in contours if cv2.contourArea(c) > min_area]

            if valid_contours:
                largest = max(valid_contours, key=cv2.contourArea)
            else:
                largest = max(contours, key=cv2.contourArea)

            cv2.drawContours(mask, [largest], -1, 255, thickness=cv2.FILLED)
        else:
            # Elliptical fallback ROI in center if no contours found
            cv2.ellipse(mask, (w // 2, int(h * 0.55)), (int(w * 0.35), int(h * 0.35)), 0, 0, 360, 255, -1)

        return mask

    def segment_unet(self, image: np.ndarray) -> np.ndarray:
        """Inference using trained U-Net checkpoint."""
        h, w = image.shape[:2]
        resized = cv2.resize(image, (256, 256))
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        tensor = torch.from_numpy(rgb.transpose((2, 0, 1))).float().unsqueeze(0) / 255.0
        tensor = tensor.to(self.device)

        with torch.no_grad():
            output = self.model(tensor)
            prob = torch.sigmoid(output).squeeze().cpu().numpy()
            pred = (prob > 0.5).astype(np.uint8) * 255

        mask = cv2.resize(pred, (w, h), interpolation=cv2.INTER_NEAREST)
        return mask

    def execute_segmentation(self, image_path: str, mask_save_path: str, overlay_save_path: str) -> Dict[str, Any]:
        """
        Execute tongue segmentation pipeline:
        - Runs neural U-Net if weights exist, otherwise CV contour saliency
        - Generates mask and overlay images
        - Returns mask metadata and model transparency notice
        """
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Unable to read image at: {image_path}")

        h, w = image.shape[:2]
        if self.model is not None:
            mask = self.segment_unet(image)
            model_info = "PyTorch U-Net (Trained Checkpoint)"
        else:
            mask = self.segment_cv_fallback(image)
            model_info = "Active Contour & Saliency (U-Net Checkpoint Awaiting Dataset Training)"

        # Save Binary Mask (255 = Tongue, 0 = Background)
        cv2.imwrite(mask_save_path, mask)

        # Create Visual Overlay (Soft medical cyan contour)
        overlay = image.copy()
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Add translucent colored overlay on tongue region
        colored_mask = np.zeros_like(image)
        colored_mask[:, :] = (235, 175, 50)  # Cyan/Medical blue BGR tint
        alpha = 0.25
        roi = cv2.bitwise_and(image, image, mask=mask)
        blended = cv2.addWeighted(colored_mask, alpha, image, 1 - alpha, 0)
        np.copyto(overlay, blended, where=cv2.cvtColor(mask, cv2.COLOR_GRAY2BGR) > 0)

        # Draw smooth boundary line
        cv2.drawContours(overlay, contours, -1, (255, 120, 0), thickness=2)  # Cyan border
        cv2.imwrite(overlay_save_path, overlay)

        tongue_pixels = int(np.count_nonzero(mask))
        total_pixels = h * w
        area_ratio = round(tongue_pixels / total_pixels, 4)

        return {
            "model_version": model_info,
            "mask_path": mask_save_path,
            "overlay_path": overlay_save_path,
            "tongue_area_percentage": round(area_ratio * 100, 2),
            "tongue_pixel_count": tongue_pixels
        }

segmentation_service = TongueSegmentationService()
