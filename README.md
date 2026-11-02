# AI Tongue Health Analyzer

> **Educational & Informational Biomedical AI System**  
> Powered by Computer Vision, U-Net Segmentation, Multi-Task EfficientNetV2, Grad-CAM Explainable AI, Retrieval-Augmented Generation (RAG), and Google Gemini LLM.

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2+-ee4c2c.svg)](https://pytorch.org/)
[![React](https://img.shields.io/badge/React-19+-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285f4.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Project Overview

The **AI Tongue Health Analyzer** is an end-to-end, production-oriented web application designed to analyze digital photographs of the human tongue for educational and screening purposes. By integrating biomedical computer vision, deep convolutional neural networks, explainability maps, and peer-reviewed medical literature retrieval, the system provides transparent, calibrated insights into lingual health characteristics.

> **CRITICAL MEDICAL DISCLAIMER:**  
> This application is strictly an **educational and informational screening tool**. It is **NOT** a diagnostic medical device and does **NOT** diagnose systemic diseases, prescribe medications, or replace direct clinical evaluation by a licensed physician, dentist, or oral maxillofacial specialist.

---

## 2. Key Architecture & AI Pipeline

```
                                      [USER / BROWSER]
                                             |
                         +-------------------+-------------------+
                         |                                       |
                   [Webcam Capture]                        [File Upload]
                         |                                       |
                         +-------------------+-------------------+
                                             v
                                   [FastAPI REST API]
                                             |
                   +-------------------------+-------------------------+
                   |                         |                         |
          [Format Validation]       [Blur Check (Laplacian)]    [Brightness & Color Check]
                   |                         |                         |
                   +-------------------------+-------------------------+
                                             v
                           [CLAHE Illumination Equalization]
                                             |
                             [U-Net Semantic Segmentation]
                                             |
                    +------------------------+------------------------+
                    |                                                 |
         [Binary Mask Generation]                            [Contour Overlay]
                    |                                                 |
                    +------------------------+------------------------+
                                             v
                     [Multi-Task EfficientNetV2 Feature Extraction]
                       • Tongue Color       • Coating Thickness
                       • Surface Texture    • Lingual Shape
                       • Fissure Density    • Teeth Mark Scalloping
                       • Visible Patches / Spots
                                             |
                                 [Grad-CAM XAI Heatmap]
                                             |
                          [RAG Semantic Medical Retrieval]
                           (Oral Medicine Literature Base)
                                             |
                           [Google Gemini 2.5 Flash LLM]
                       (English & Telugu Structured Insights)
                                             |
                               [Medical Safety Validator]
                         (Disclaimer Enforcement & Red Flags)
                                             |
                         +-------------------+-------------------+
                         |                                       |
                [Interactive Dashboard]                 [ReportLab PDF Export]
```

---

## 3. Technology Stack

### Frontend
- **Framework:** React 19 + Vite 8
- **Styling:** Vanilla CSS + Tailwind CSS v4 (Medical theme: Navy Blue, Soft Cyan, Crisp White)
- **Routing:** React Router v7
- **HTTP Client:** Axios (with automatic JWT authentication interceptors)
- **Data Visualization:** Recharts (Calibrated model confidence charts)
- **Icons:** Lucide React
- **Webcam:** HTML5 `navigator.mediaDevices.getUserMedia` integration

### Backend
- **Framework:** FastAPI (Python 3.11) + Uvicorn
- **ORM & Database:** SQLAlchemy with MySQL 8.0 primary engine and automatic SQLite fallback
- **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
- **Data Validation:** Pydantic v2 schemas (`model_config = ConfigDict(...)`)
- **PDF Generation:** ReportLab 5.1

### Computer Vision & Deep Learning
- **Image Processing:** OpenCV (`cv2`), NumPy, Pillow, Scikit-Image, Scikit-Learn
- **Preprocessing:** Laplacian variance blur detection, CIE LAB color space conversion, CLAHE on Lightness channel, bilateral noise filtering
- **Segmentation:** PyTorch U-Net architecture with combined Dice Loss and Binary Cross Entropy (DiceBCELoss)
- **Multi-Task Classification:** PyTorch EfficientNetV2-S with multi-head outputs
- **Explainable AI:** Grad-CAM (Gradient-weighted Class Activation Mapping)

### LLM & RAG Knowledge Retrieval
- **LLM Engine:** Google Gemini (`gemini-2.5-flash`) via the official `google-genai` SDK
- **RAG Architecture:** TF-IDF / vector semantic chunk retrieval with relevance thresholding
- **Multilingual Support:** English (EN) and Telugu (తెలుగు)
- **Knowledge Sources:** British Dental Journal, Journal of Oral Pathology & Medicine, International Journal of Oral Science, AAOM Guidelines

---

## 4. Frontend Pages (9 Modules)

1. **Landing Page (`/`):** Hero section, live diagnostic preview, 4-step workflow, capability cards, tech badges, and medical safety notices.
2. **Authentication (`/login`, `/register`):** JWT login with demo credential fast-fill and registration with mandatory legal disclaimer consent.
3. **User Dashboard (`/dashboard`):** Overview metrics (Total Scans, Last Date, Coating status), recent analysis card with thumbnail, and history table.
4. **Tongue Upload (`/upload`):** Drag-and-drop zone, file browser, live webcam capture, clinical photo guidelines, and language switcher.
5. **Real-Time Processing:** 7-stage animated progress pipeline tracking actual backend processing.
6. **Results Dashboard (`/results/:id`):** 5-view image gallery (Original, Processed, Mask, Overlay, Grad-CAM), Recharts confidence score bar chart, 7 extracted feature cards, structured Gemini medical synthesis, and PDF download button.
7. **Analysis History (`/history`):** Filterable, searchable chronological table/card view with delete modal and PDF export.
8. **AI Health Chatbot (`/chat`):** Conversational oral assistant grounded in RAG literature, pre-configured prompts, Telugu support, and source citations.
9. **Profile & Settings (`/profile`):** Personal details, image retention policy (30/90 days or ephemeral), and permanent account deletion.

---

## 5. Local Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 20+ & npm 10+
- (Optional) MySQL 8.0 (The backend automatically falls back to local SQLite if MySQL credentials are not yet configured)

---

### Step 1: Clone Repository & Setup Backend

```bash
git clone https://github.com/your-username/AI-Tongue-Health-Analyzer.git
cd AI-Tongue-Health-Analyzer/backend

# Create virtual environment (optional but recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Configure `.env` if desired:
```ini
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/tongue_db
# Set your Gemini API key for live generation (offline clinical fallback included when empty)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
SECRET_KEY=your-production-secret-key-2026
```

Start the FastAPI server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend API will be accessible at `http://localhost:8000` (Swagger UI: `http://localhost:8000/docs`).

---

### Step 2: Setup & Launch Frontend

In a separate terminal:
```bash
cd AI-Tongue-Health-Analyzer/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The React application will be accessible at `http://localhost:5173`.

---

### Step 3: Run Test Suite

Run the complete backend test suite:
```bash
pytest backend/tests -v
```

---

## 6. Model Training & CLI Inference

### Standalone Inference Tool
Analyze any tongue photo from the command line:
```bash
python ai_models/src/predict.py ai_models/datasets/sample_demo.jpg --output_dir ./output
```

### PyTorch Model Training
Train U-Net or Multi-Task EfficientNetV2:
```bash
# Train Multi-Task EfficientNetV2
python ai_models/src/train.py --task multitask --epochs 10 --lr 0.0001

# Train U-Net Tongue Segmentation
python ai_models/src/train.py --task unet --epochs 10 --lr 0.0001

# Evaluate Model Checkpoints
python ai_models/src/evaluate.py
```

---

## 7. Docker Deployment

Deploy the entire multi-container stack with a single command:
```bash
docker-compose up --build -d
```
Services deployed:
- **`tongue_mysql_db`:** MySQL 8.0 on port 3306 with healthcheck
- **`tongue_backend_api`:** FastAPI Python application on port 8000
- **`tongue_frontend_web`:** Nginx-served React frontend on port 80

---

## 8. Medical Safety & Clinical Guardrails

1. **Non-Diagnostic Scoping:** The application explicitly characterizes visual morphology (e.g. "Thin white coating", "Erythematous tone") rather than asserting disease diagnoses.
2. **Prescription Blocking:** Queries and generated text requesting medication doses or antibiotics are intercepted and blocked by `MedicalSafetyValidator`.
3. **Emergency Red Flag Guidance:** Features or user queries involving non-healing ulcers (>14 days), unprovoked bleeding, difficulty swallowing (dysphagia), or indurated lumps trigger urgent professional consultation advisories.
4. **Patient Data Privacy:** Complete data retention control (configurable 30/90 days retention or instant permanent deletion).

---

## 9. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
