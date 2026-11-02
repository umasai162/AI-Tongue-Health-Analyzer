import os
import cv2
import numpy as np
from PIL import Image
from typing import Tuple, Dict, Any, Optional

class ImagePreprocessor:
    """
    Computer Vision Preprocessing Pipeline for Tongue Image Analysis.
    Preserves original image for authentic color extraction while generating
    enhanced representations for edge, contour, and neural network segmentation.
    """

    MIN_RESOLUTION = (180, 180)
    RECOMMENDED_RESOLUTION = (400, 400)
    BLUR_THRESHOLD = 18.0  # Realistic threshold for mucosal soft tissue
    MIN_BRIGHTNESS = 25.0  # Grayscale mean brightness threshold (too dark)
    MAX_BRIGHTNESS = 235.0 # Grayscale mean brightness threshold (overexposed)

    @staticmethod
    def load_image(image_path: str) -> np.ndarray:
        """Load image safely from disk using OpenCV (BGR format)."""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at: {image_path}")
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Failed to decode image from path: {image_path}")
        return image

    @classmethod
    def assess_quality(cls, image: np.ndarray) -> Dict[str, Any]:
        """
        Assess tongue image quality including resolution, blurriness,
        brightness, and basic pink/red tongue color presence.
        """
        h, w, c = image.shape
        resolution_ok = (h >= cls.MIN_RESOLUTION[0] and w >= cls.MIN_RESOLUTION[1])

        # Convert to Grayscale for Blur and Brightness checks
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # 1. Blur Detection using Laplacian Variance
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        is_severely_blurry = laplacian_var < cls.BLUR_THRESHOLD
        is_soft_focus = (cls.BLUR_THRESHOLD <= laplacian_var < 50.0)

        # 2. Brightness Assessment
        mean_brightness = float(np.mean(gray))
        is_dark = mean_brightness < cls.MIN_BRIGHTNESS
        is_overexposed = mean_brightness > cls.MAX_BRIGHTNESS

        # 3. Tongue Color Presence Check (in HSV)
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        # Red/Pink tones in HSV: 0-25 and 155-180
        mask_red1 = cv2.inRange(hsv, np.array([0, 30, 40]), np.array([25, 255, 255]))
        mask_red2 = cv2.inRange(hsv, np.array([150, 30, 40]), np.array([180, 255, 255]))
        red_pink_mask = cv2.bitwise_or(mask_red1, mask_red2)
        red_pink_ratio = float(np.count_nonzero(red_pink_mask) / (h * w))
        has_tongue_colors = red_pink_ratio > 0.03  # At least 3% pink/red hue

        # Determine overall status and recommendations
        status = "Good"
        recommendations = []
        is_acceptable = True

        if not resolution_ok:
            status = "Low Resolution"
            is_acceptable = False
            recommendations.append(f"Image resolution ({w}x{h}) is too low. Minimum resolution is {cls.MIN_RESOLUTION[0]}x{cls.MIN_RESOLUTION[1]} pixels.")
        
        if is_severely_blurry:
            status = "Blurry"
            is_acceptable = False
            recommendations.append("Image is out of focus. Please hold the camera steady in good light, or try one of the neat sample images.")
        elif is_soft_focus:
            status = "Acceptable (Soft Focus)"
            is_acceptable = True
            recommendations.append("Image focus is acceptable for analysis. Clearer lighting can improve feature accuracy.")

        if is_dark:
            status = "Dark"
            is_acceptable = False
            recommendations.append("Image is too dark. Please use natural or bright indoor lighting.")
        elif is_overexposed:
            status = "Overexposed"
            is_acceptable = False
            recommendations.append("Image is washed out. Avoid harsh direct flash.")

        if not has_tongue_colors:
            recommendations.append("Ensure the tongue is centered and clearly extended.")

        # Color distribution summary in LAB space
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l_mean = float(np.mean(lab[:, :, 0]))
        a_mean = float(np.mean(lab[:, :, 1]))
        b_mean = float(np.mean(lab[:, :, 2]))

        return {
            "is_acceptable": is_acceptable,
            "status": status,
            "blur_score": round(laplacian_var, 2),
            "brightness_score": round(mean_brightness, 2),
            "resolution": f"{w}x{h}",
            "color_distribution": {
                "L_lightness": round(l_mean, 2),
                "a_red_green": round(a_mean, 2),
                "b_yellow_blue": round(b_mean, 2),
                "red_pink_ratio": round(red_pink_ratio, 3)
            },
            "recommendation": " ".join(recommendations) if recommendations else "Image quality is optimal for analysis."
        }

    @staticmethod
    def enhance_illumination_clahe(image: np.ndarray) -> np.ndarray:
        """
        Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        strictly to the L (Lightness) channel of CIE LAB color space.
        Preserves authentic hue and saturation balance in A & B channels.
        """
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l_chan, a_chan, b_chan = cv2.split(lab)

        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l_clahe = clahe.apply(l_chan)

        enhanced_lab = cv2.merge((l_clahe, a_chan, b_chan))
        return cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    @staticmethod
    def reduce_noise(image: np.ndarray) -> np.ndarray:
        """
        Perform bilateral filtering or fast non-local means denoising
        to preserve sharp anatomical borders and papillae details.
        """
        # Bilateral filter is computationally fast while preserving edges
        return cv2.bilateralFilter(image, d=7, sigmaColor=50, sigmaSpace=50)

    @classmethod
    def preprocess_pipeline(cls, image_path: str, output_path: str) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Full computer vision preprocessing pipeline:
        1. Loads image
        2. Assesses quality
        3. Denoises
        4. Enhances illumination via CLAHE (L-channel only)
        5. Saves processed version
        Returns: (processed_bgr_image, quality_report)
        """
        original = cls.load_image(image_path)
        quality = cls.assess_quality(original)

        denoised = cls.reduce_noise(original)
        clahe_enhanced = cls.enhance_illumination_clahe(denoised)

        # Save processed visualization
        cv2.imwrite(output_path, clahe_enhanced)

        return clahe_enhanced, quality
