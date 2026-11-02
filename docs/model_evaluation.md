# AI Model Evaluation & Quality Assurance

## 1. Segmentation Pipeline Evaluation

The primary segmentation architecture is **U-Net** trained with combined **Dice Loss + Binary Cross Entropy (DiceBCE)**.

$$\mathcal{L}_{\text{total}} = \mathcal{L}_{\text{BCE}} + (1 - \text{Dice})$$

### Metrics Tracked:
- **Dice Similarity Coefficient (F1):** Measures boundary spatial overlap between prediction and manual ground-truth mask.
- **Intersection over Union (IoU / Jaccard Index):** Quantifies lingual ROI agreement.
- **Precision & Recall:** Assesses over-segmentation into facial skin vs under-segmentation missing the tongue tip.

---

## 2. Multi-Task EfficientNetV2 Classification Evaluation

The shared feature backbone (EfficientNetV2-S) feeds 7 specialized classification heads:

| Task Name | Classes | Loss Function | Evaluation Metric |
| :--- | :--- | :--- | :--- |
| **Tongue Color** | Normal Pink, Pale, Red, Deep Red, Bluish | CrossEntropy | Multi-class Macro F1, Confusion Matrix |
| **Coating** | Thin White, Thick White, Yellow, Peeled | CrossEntropy | Balanced Accuracy, ROC-AUC |
| **Surface Texture** | Smooth/Normal, Rough, Fissured | CrossEntropy | Precision & Recall |
| **Tongue Shape** | Normal, Swollen/Enlarged, Thin | CrossEntropy | Accuracy |
| **Fissures** | Absent, Mild/Superficial, Deep | CrossEntropy | Quadratic Weighted Kappa |
| **Teeth Marks** | Absent, Present (Scalloped) | Binary CrossEntropy | Sensitivity & Specificity |
| **Visible Patches** | None, Geographic, Erythematous | CrossEntropy | Precision-Recall AUC |

---

## 3. Explainability (Grad-CAM) Validation

Grad-CAM (Gradient-weighted Class Activation Mapping) computes the gradients of the target class score with respect to the feature activation maps of the final convolutional layer:

$$L_{\text{Grad-CAM}}^c = \text{ReLU}\left( \sum_k \alpha_k^c A^k \right)$$

where $\alpha_k^c = \frac{1}{Z} \sum_i \sum_j \frac{\partial y^c}{\partial A_{i,j}^k}$.

The resulting heatmap is verified against the lingual segmentation mask to ensure activations concentrate on the dorsal mucosa (coating, median furrow, lateral scallop borders) rather than background noise.
