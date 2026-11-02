import os
import cv2
import numpy as np

def create_sample_tongue_image(output_path: str = "sample_tongue.jpg"):
    """
    Generate an anatomically structured synthetic sample tongue image
    (smooth lingual body, pink mucosa, central thin white coating, papillated tip)
    to validate the computer vision, segmentation, and classification pipeline.
    """
    h, w = 512, 512
    # Realistic oral cavity background (dark reddish black)
    img = np.zeros((h, w, 3), dtype=np.uint8)
    img[:] = (20, 15, 25)

    # Upper/lower lips contour
    cv2.ellipse(img, (256, 120), (160, 60), 0, 0, 360, (50, 40, 70), -1)

    # Tongue Body (Soft natural pink BGR: [140, 120, 225])
    tongue_center = (256, 300)
    tongue_axes = (140, 180)
    cv2.ellipse(img, tongue_center, tongue_axes, 0, 0, 360, (140, 120, 225), -1)

    # Slight central groove (median lingual sulcus)
    cv2.line(img, (256, 160), (256, 390), (120, 100, 200), 3)

    # Dorsal Thin White Coating in center
    overlay = img.copy()
    cv2.ellipse(overlay, (256, 280), (80, 110), 0, 0, 360, (215, 215, 230), -1)
    cv2.addWeighted(overlay, 0.45, img, 0.55, 0, img)

    # Scattered fungiform papillae red dots near tip
    np.random.seed(42)
    for _ in range(60):
        rx = np.random.randint(180, 332)
        ry = np.random.randint(350, 450)
        # Check if inside ellipse
        norm_x = (rx - tongue_center[0]) / tongue_axes[0]
        norm_y = (ry - tongue_center[1]) / tongue_axes[1]
        if norm_x**2 + norm_y**2 < 0.85:
            cv2.circle(img, (rx, ry), 2, (100, 80, 235), -1)

    # Soft Gaussian blur for realistic photographic skin texture
    img = cv2.GaussianBlur(img, (5, 5), 0)

    cv2.imwrite(output_path, img)
    print(f"Sample anatomical tongue image created at: {output_path}")
    return output_path

if __name__ == "__main__":
    create_sample_tongue_image()
