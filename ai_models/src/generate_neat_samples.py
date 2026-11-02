import os
import cv2
import numpy as np

def generate_realistic_samples(output_dir="frontend/public/samples"):
    os.makedirs(output_dir, exist_ok=True)
    h, w = 600, 600

    # Base oral background
    def create_oral_base():
        img = np.zeros((h, w, 3), dtype=np.uint8)
        img[:] = (20, 15, 25) # Dark oral cavity
        cv2.ellipse(img, (300, 140), (200, 70), 0, 0, 360, (55, 45, 80), -1) # Upper/lower lips
        return img

    tongue_center = (300, 350)
    tongue_axes = (165, 215)

    # ==========================================
    # 1. NORMAL HEALTHY PINK TONGUE
    # ==========================================
    img1 = create_oral_base()
    # Balanced natural pink mucosa: BGR (150, 130, 230)
    cv2.ellipse(img1, tongue_center, tongue_axes, 0, 0, 360, (150, 130, 230), -1)
    # Subtle central line (median sulcus)
    cv2.line(img1, (300, 200), (300, 450), (135, 115, 210), 2)
    # Thin, delicate white physiological film
    overlay1 = img1.copy()
    cv2.ellipse(overlay1, (300, 320), (80, 110), 0, 0, 360, (215, 215, 235), -1)
    cv2.addWeighted(overlay1, 0.35, img1, 0.65, 0, img1)
    # Subtle natural red fungiform papillae
    np.random.seed(42)
    for _ in range(70):
        rx = np.random.randint(180, 420)
        ry = np.random.randint(320, 520)
        norm_x = (rx - tongue_center[0]) / tongue_axes[0]
        norm_y = (ry - tongue_center[1]) / tongue_axes[1]
        if norm_x**2 + norm_y**2 < 0.85:
            cv2.circle(img1, (rx, ry), 2, (115, 95, 245), -1)
    # Smooth blur for organic photographic skin texture
    img1 = cv2.GaussianBlur(img1, (3, 3), 0)
    cv2.imwrite(os.path.join(output_dir, "normal_pink.jpg"), img1)

    # ==========================================
    # 2. COATED DORSUM (THICK WHITE / YELLOWISH FUR)
    # ==========================================
    img2 = create_oral_base()
    # Pinkish-red mucosa underneath: BGR (130, 110, 220)
    cv2.ellipse(img2, tongue_center, tongue_axes, 0, 0, 360, (130, 110, 220), -1)
    # Heavy, thick whitish-cream coating covering 70% of dorsal surface
    overlay2 = img2.copy()
    # Extensive white/pale cream coating
    cv2.ellipse(overlay2, (300, 330), (130, 175), 0, 0, 360, (230, 235, 245), -1)
    # Slightly yellowish central layer
    cv2.ellipse(overlay2, (300, 310), (95, 130), 0, 0, 360, (175, 220, 240), -1)
    cv2.addWeighted(overlay2, 0.75, img2, 0.25, 0, img2)
    # Biofilm granular texture
    for _ in range(250):
        rx = np.random.randint(180, 420)
        ry = np.random.randint(240, 470)
        norm_x = (rx - tongue_center[0]) / 130
        norm_y = (ry - 330) / 175
        if norm_x**2 + norm_y**2 < 0.9:
            cv2.circle(img2, (rx, ry), np.random.randint(2, 4), (195, 225, 240), -1)
    img2 = cv2.GaussianBlur(img2, (3, 3), 0)
    cv2.imwrite(os.path.join(output_dir, "coated_white.jpg"), img2)

    # ==========================================
    # 3. FISSURED TONGUE (DEEP CENTRAL & TRANSVERSE GROOVES)
    # ==========================================
    img3 = create_oral_base()
    # Deep erythematous mucosa: BGR (115, 95, 235)
    cv2.ellipse(img3, tongue_center, tongue_axes, 0, 0, 360, (115, 95, 235), -1)
    # Deep central dark fissure (cleft width 6px)
    cv2.line(img3, (300, 180), (300, 480), (45, 30, 110), 6)
    # Multiple distinct transverse branching fissures
    branches = [
        ((300, 240), (220, 225)), ((300, 240), (380, 225)),
        ((300, 280), (210, 270)), ((300, 280), (390, 270)),
        ((300, 330), (205, 320)), ((300, 330), (395, 320)),
        ((300, 380), (215, 375)), ((300, 380), (385, 375)),
        ((300, 420), (235, 415)), ((300, 420), (365, 415)),
        ((300, 450), (260, 455)), ((300, 450), (340, 455)),
    ]
    for pt1, pt2 in branches:
        cv2.line(img3, pt1, pt2, (45, 30, 110), 4)
    # Rough surface texture with minimal coating
    for _ in range(80):
        rx = np.random.randint(180, 420)
        ry = np.random.randint(240, 500)
        norm_x = (rx - tongue_center[0]) / tongue_axes[0]
        norm_y = (ry - tongue_center[1]) / tongue_axes[1]
        if norm_x**2 + norm_y**2 < 0.8:
            cv2.circle(img3, (rx, ry), 2, (80, 60, 190), -1)
    img3 = cv2.GaussianBlur(img3, (3, 3), 0)
    cv2.imwrite(os.path.join(output_dir, "fissured_tongue.jpg"), img3)

    # ==========================================
    # 4. SCALLOPED TONGUE (PROMINENT LATERAL BITE MARKS)
    # ==========================================
    img4 = create_oral_base()
    # Swollen enlarged body: wider axes (180, 215)
    swollen_axes = (180, 215)
    cv2.ellipse(img4, tongue_center, swollen_axes, 0, 0, 360, (140, 120, 225), -1)
    # Rhythmic indentations (teeth bite scallops) carved into lateral boundaries
    scallop_y = [250, 295, 340, 385, 430, 470]
    for y in scallop_y:
        # Left indentations
        lx = int(300 - swollen_axes[0] * np.sqrt(max(1 - ((y - 350)/215)**2, 0)))
        cv2.circle(img4, (lx, y), 22, (20, 15, 25), -1)
        # Smooth scalloped margin shading
        cv2.circle(img4, (lx + 6, y), 20, (110, 90, 195), 2)

        # Right indentations
        rx = int(300 + swollen_axes[0] * np.sqrt(max(1 - ((y - 350)/215)**2, 0)))
        cv2.circle(img4, (rx, y), 22, (20, 15, 25), -1)
        # Smooth scalloped margin shading
        cv2.circle(img4, (rx - 6, y), 20, (110, 90, 195), 2)

    img4 = cv2.GaussianBlur(img4, (3, 3), 0)
    cv2.imwrite(os.path.join(output_dir, "scalloped_edges.jpg"), img4)

    print("Successfully generated 4 realistic clinical sample images in:", output_dir)

if __name__ == "__main__":
    generate_realistic_samples()
