# Lingual Health Datasets — Documentation & Research Evaluation

## 1. Candidate Research Datasets Evaluated

### 1.1 TonguExpert Dataset
- **Description:** Multi-center clinical dataset containing dorsal tongue photographs annotated by clinical experts.
- **Annotation Categories:** Lingual body color (Pale, Light Red, Red, Deep Red, Bluish), coating color (White, Yellow, Gray/Black), coating thickness (Thin, Thick, Peeled).
- **License / Permissions:** Academic research license. Subject identifiers are pseudonymized.
- **Splitting Strategy:** Patient-level stratification to ensure zero subject overlap between training, validation, and test partitions.

### 1.2 TMC-Tongue Dataset
- **Description:** Standardized traditional medicine computerized tongue dataset collected under calibrated controlled lighting (D65 light source).
- **Key Characteristics:** Uniform background with minimal illumination variance. Ideal for baseline color distribution calibration.
- **Limitations:** Controlled studio capture conditions differ from smartphone camera environments in home use, requiring robust data augmentations (ColorJitter, CLAHE).

### 1.3 TongueAtlas-4K
- **Description:** High-resolution 4K oral cavity dataset with detailed semantic polygon masks separating dorsal mucosa from lips, teeth, and uvula.
- **Utility:** Primary reference for training U-Net and SegFormer semantic segmentation models.

---

## 2. Ethical Standards & Quality Assurance
1. **No Synthetic Label Fabrication:** Model weights must only be updated using authenticated ground-truth annotations from verified clinical datasets.
2. **Patient-Level Data Splitting:** When multiple images exist for a single subject, all samples belonging to `patient_id` are grouped strictly into either the training or testing cohort to prevent data leakage.
3. **Transparent Model States:** When neural checkpoints are awaiting local training, the system explicitly reports calibrated computer vision analysis mode rather than displaying fictitious predictions.
