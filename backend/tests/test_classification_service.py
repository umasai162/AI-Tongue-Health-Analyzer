import os
import cv2
import numpy as np
import pytest
from app.services.segmentation_service import segmentation_service
from app.services.classification_service import classification_service

def test_classification_on_canonical_samples():
    sample_dir = os.path.abspath("frontend/public/samples")
    if not os.path.exists(sample_dir):
        pytest.skip("Sample images not available in environment")

    # 1. Normal Pink Tongue
    normal_p = os.path.join(sample_dir, "normal_pink.jpg")
    mask_tmp = "test_normal_mask.png"
    overlay_tmp = "test_normal_over.png"
    
    seg = segmentation_service.execute_segmentation(normal_p, mask_tmp, overlay_tmp)
    clf = classification_service.classify_image(normal_p, mask_tmp)
    preds = {p["feature_name"]: p["predicted_label"] for p in clf["predictions"]}

    assert preds["Tongue Color"] == "Normal Pink"
    assert preds["Tongue Coating"] == "Thin White (Normal)"
    assert preds["Surface Texture"] == "Smooth/Normal"
    assert preds["Tongue Shape"] == "Normal"
    assert preds["Fissures"] == "Absent"
    assert preds["Teeth Marks"] == "Absent"
    assert preds["Visible Patches"] == "None/Uniform"

    # 2. Coated White Tongue
    coated_p = os.path.join(sample_dir, "coated_white.jpg")
    seg = segmentation_service.execute_segmentation(coated_p, mask_tmp, overlay_tmp)
    clf = classification_service.classify_image(coated_p, mask_tmp)
    preds = {p["feature_name"]: p["predicted_label"] for p in clf["predictions"]}
    assert preds["Tongue Coating"] == "Thick White"
    assert preds["Fissures"] == "Absent"

    # 3. Fissured Tongue
    fissured_p = os.path.join(sample_dir, "fissured_tongue.jpg")
    seg = segmentation_service.execute_segmentation(fissured_p, mask_tmp, overlay_tmp)
    clf = classification_service.classify_image(fissured_p, mask_tmp)
    preds = {p["feature_name"]: p["predicted_label"] for p in clf["predictions"]}
    assert preds["Fissures"] == "Deep/Severe"
    assert preds["Surface Texture"] == "Fissured"

    # 4. Scalloped Edges Tongue
    scalloped_p = os.path.join(sample_dir, "scalloped_edges.jpg")
    seg = segmentation_service.execute_segmentation(scalloped_p, mask_tmp, overlay_tmp)
    clf = classification_service.classify_image(scalloped_p, mask_tmp)
    preds = {p["feature_name"]: p["predicted_label"] for p in clf["predictions"]}
    assert preds["Teeth Marks"] == "Present (Scalloped)"
    assert preds["Tongue Shape"] == "Swollen/Enlarged"

    # Clean up
    for p in [mask_tmp, overlay_tmp]:
        if os.path.exists(p):
            os.remove(p)

