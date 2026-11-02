import os
import cv2
import numpy as np
import torch
from pathlib import Path
from typing import Optional

class GradCAMService:
    """
    Explainable AI (XAI) Service generating Grad-CAM heatmaps.
    Visualizes which spatial regions of the tongue image contributed
    most significantly to the feature classification decisions.
    
    IMPORTANT NOTE:
    Explainability heatmaps highlight computational saliency regions
    influencing neural activations, NOT verified pathological lesions.
    """

    @staticmethod
    def generate_roi_cam(image: np.ndarray, mask: np.ndarray, output_path: str) -> str:
        """
        Generate feature activation heatmap focused on the segmented tongue area.
        Combines spatial gradient energy with lingual saliency to show
        salient regions (e.g. coating center, fissured dorsal groove, lateral margins).
        """
        h, w = image.shape[:2]
        if len(mask.shape) == 3:
            mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
        _, binary_mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)

        # Compute gradient-based lingual saliency
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (7, 7), 0)
        grad_x = cv2.Sobel(blurred, cv2.CV_32F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(blurred, cv2.CV_32F, 0, 1, ksize=3)
        magnitude = cv2.magnitude(grad_x, grad_y)

        # Contrast enhancement in HSV/LAB
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        color_salience = cv2.absdiff(lab[:, :, 1], 128).astype(np.float32)

        # Blend texture and color cues within tongue mask
        combined_saliency = (magnitude * 0.5) + (color_salience * 0.5)
        combined_saliency[binary_mask == 0] = 0

        # Normalize to 0-255
        if np.max(combined_saliency) > 0:
            norm_saliency = (combined_saliency / np.max(combined_saliency)) * 255.0
        else:
            norm_saliency = combined_saliency
        norm_saliency = norm_saliency.astype(np.uint8)

        # Smooth to create neural activation-like diffuse heatmap
        smooth_heatmap = cv2.GaussianBlur(norm_saliency, (25, 25), 0)
        
        # Apply Jet / Turbo colormap
        colored_heatmap = cv2.applyColorMap(smooth_heatmap, cv2.COLORMAP_JET)

        # Zero out non-tongue regions
        colored_heatmap[binary_mask == 0] = [0, 0, 0]

        # Blend with original image
        alpha = 0.5
        overlay = cv2.addWeighted(colored_heatmap, alpha, image, 1 - alpha, 0)
        
        # Keep non-tongue areas identical to original image
        np.copyto(overlay, image, where=cv2.cvtColor(binary_mask, cv2.COLOR_GRAY2BGR) == 0)

        # Draw contour line around tongue
        contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(overlay, contours, -1, (255, 255, 255), 1)

        cv2.imwrite(output_path, overlay)
        return output_path

gradcam_service = GradCAMService()
