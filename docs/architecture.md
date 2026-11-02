# AI Tongue Health Analyzer — System Architecture

## 1. Architectural Overview

The **AI Tongue Health Analyzer** is a multi-tier, modular biomedical application designed for educational lingual analysis. It pairs computer vision (illumination correction, active contour/U-Net segmentation, multi-task feature classification, Grad-CAM explainability) with an evidence-grounded Retrieval-Augmented Generation (RAG) system and Google Gemini LLM.

```
+-----------------------------------------------------------------------------------+
|                                 USER / CLIENT                                     |
|                       (Desktop / Mobile Web Browser)                              |
+-----------------------------------------------------------------------------------+
                                          |
                                   HTTPS / REST
                                          v
+-----------------------------------------------------------------------------------+
|                                REACT FRONTEND                                     |
|  - React 19 + Vite + Tailwind CSS                                                 |
|  - Modular Component Pages: Landing, Auth, Dashboard, Upload, Results, Chat, Hist|
|  - Recharts Quantitative Confidence Visualizations                               |
|  - HTML5 Live Webcam Capture & Drag-and-Drop Image Ingestion                      |
+-----------------------------------------------------------------------------------+
                                          |
                                    Reverse Proxy
                                          v
+-----------------------------------------------------------------------------------+
|                                FASTAPI BACKEND                                    |
|  - Python 3.11 + Uvicorn Async Architecture                                       |
|  - JWT Authentication & Patient Consent Logging                                   |
|  - PyMySQL / SQLAlchemy ORM (MySQL 8.0 Primary with SQLite Fallback)              |
+-----------------------------------------------------------------------------------+
     |                     |                      |                    |
     v                     v                      v                    v
+---------------+  +------------------+  +------------------+  +-------------------+
| PREPROCESSING |  |   SEGMENTATION   |  |  CLASSIFICATION  |  |    EXPLAINABLE    |
| (OpenCV / PIL)|  |     (U-Net)      |  | (EfficientNetV2) |  |   AI (Grad-CAM)   |
| - Laplacian   |  | - Lingual Tissue |  | - 7 Multi-Task   |  | - Spatial gradient|
|   blur check  |  |   Extraction     |  |   Clinical Heads |  |   saliency        |
| - Brightness  |  | - Contour Mask   |  | - Calibrated     |  | - Lingual heatmap |
| - CLAHE (LAB) |  | - Overlay Tint   |  |   Confidence     |  |   overlay         |
+---------------+  +------------------+  +------------------+  +-------------------+
                                                                       |
                                                                       v
+-----------------------------------------------------------------------------------+
|                        RAG & GEMINI INTELLIGENCE ENGINE                           |
|  - Knowledge Base: Peer-reviewed oral medicine clinical guidelines & literature   |
|  - TF-IDF / Vector Store Semantic Retrieval with Relevance Filtering             |
|  - Google Gemini 2.5 Flash via official `google-genai` SDK                        |
|  - Medical Safety Validator: Disclaimers, Prescription Blocking, Red Flag Triage  |
|  - Bilingual Synthesis: English & Telugu (తెలుగు)                                 |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                           REPORT GENERATION ENGINE                                |
|  - ReportLab PDF Generation Engine                                                |
|  - Clinical Tables, Multi-Visual Previews (Original, CLAHE, Mask, Grad-CAM)       |
|  - Downloadable Educational Health Summaries                                      |
+-----------------------------------------------------------------------------------+
```

## 2. Component Directory Architecture

```
AI-Tongue-Health-Analyzer/
backend/
    app/
        main.py                  # FastAPI Application & Route Mounting
        config.py                # Pydantic Settings & Environment Configurations
        database.py              # SQLAlchemy Engine with MySQL & SQLite Fallback
        models/                  # Database Entities (User, Image, Analysis, Report, Consent)
        schemas/                 # Pydantic Request/Response DTOs
        routers/                 # API Controllers (auth, tongue, ai, history, reports)
        services/                # Core Business Logic & AI Pipeline
            preprocessing.py     # Optical validation, Laplacian blur, CLAHE in LAB
            segmentation_service.py # U-Net inference & contour fallback
            classification_service.py # Multi-task EfficientNetV2 inference
            gradcam_service.py   # Explainable AI heatmap generation
            rag_service.py       # Document indexing & semantic literature retrieval
            llm_service.py       # Gemini 2.5 Flash SDK integration & Telugu translator
            medical_safety.py    # Non-diagnostic guardrails & prescription blocking
            pdf_service.py       # ReportLab PDF health report compiler
        prompts/                 # Safety-enforced LLM prompt templates
        utils/                   # JWT tokens & bcrypt password hashing
    uploads/                     # Private user image and artifact storage
    generated_reports/           # Compiled PDF reports
    requirements.txt             # Backend dependencies
    .env.example                 # Example environment variables
frontend/
    src/
        components/              # Navbar, Footer, ProtectedRoute
        context/                 # AuthContext (JWT session management)
        pages/                   # 9 Dedicated Views
        services/                # Axios API client with interceptors
        App.jsx                  # React Router configuration
        main.jsx                 # Entrypoint
        index.css                # Tailwind CSS v4 & custom medical tokens
    package.json                 # Node dependencies
ai_models/
    src/
        dataset.py               # Patient-level stratified dataset loader
        segmentation.py          # PyTorch U-Net & SegFormer experimental architectures
        classification.py        # Dataset evaluation & confusion matrix generator
        multitask_model.py       # Multi-task EfficientNetV2-S model definition
        train.py                 # Multi-task and U-Net training loops
        evaluate.py              # Checkpoint evaluation script
        predict.py               # Standalone CLI inference tool
    checkpoints/                 # PyTorch model weights storage
knowledge_base/
    documents/                   # Clinical oral medicine research literature
    vector_db/                   # Vector index store
docs/
    architecture.md              # System design & pipeline specification
    api_documentation.md         # REST API schema documentation
    dataset_documentation.md     # Lingual dataset evaluations & split strategies
    model_evaluation.md          # Multi-task metrics & explainability evaluation
docker-compose.yml               # Multi-container production deployment
README.md                        # Master setup & developer guide
```
