import numpy as np
import cv2
from app.services.preprocessing import ImagePreprocessor

def test_blur_detection_sharp_image():
    # Create sharp synthetic image with sharp edges
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    img[50:250, 50:250] = 255
    cv2.circle(img, (150, 150), 50, (0, 0, 255), -1)

    eval_result = ImagePreprocessor.assess_quality(img)
    assert eval_result["blur_score"] > 80.0

def test_blur_detection_blurred_image():
    # Create blurred image
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    img[50:250, 50:250] = 255
    blurred = cv2.GaussianBlur(img, (45, 45), 0)

    eval_result = ImagePreprocessor.assess_quality(blurred)
    assert eval_result["blur_score"] < 80.0
    assert eval_result["status"] == "Blurry"

def test_clahe_enhancement_preserves_shape():
    img = np.full((256, 256, 3), 120, dtype=np.uint8)
    enhanced = ImagePreprocessor.enhance_illumination_clahe(img)
    assert enhanced.shape == img.shape
    assert enhanced.dtype == np.uint8
