# API Documentation — AI Tongue Health Analyzer

All endpoints are hosted on the FastAPI backend (Default: `http://localhost:8000`).
Interactive Swagger UI is accessible at `/docs` and ReDoc at `/redoc`.

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates a new patient account and stores mandatory consent records.
- **Request Body (JSON):**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123",
    "consent_disclaimer": true,
    "consent_retention": true
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "created_at": "2026-10-30T10:00:00"
    }
  }
  ```

### `POST /api/auth/login`
Authenticates email and password, returning a JWT token.
- **Request Body (JSON):**
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response (200 OK):** Token object with Bearer token.

### `GET /api/auth/me`
Retrieves the authenticated user's profile.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** User details object.

### `PUT /api/auth/profile`
Updates patient profile parameters (name).

### `DELETE /api/auth/account`
Permanently deletes the user account, associated tongue images, and clinical reports.

---

## 2. Tongue Image & Analysis Endpoints (`/api/tongue`)

### `POST /api/tongue/upload`
Uploads a tongue image for optical verification (blur check, brightness, color presence).
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Data:** `file: <Binary Image File (JPG, PNG, WEBP)>`
- **Response (200 OK):**
  ```json
  {
    "image_id": 4,
    "image_url": "/uploads/3f4e5a_tongue.jpg",
    "quality_assessment": {
      "is_acceptable": true,
      "status": "Good",
      "blur_score": 142.3,
      "brightness_score": 118.5,
      "color_distribution": {
        "L_lightness": 124.2,
        "a_red_green": 152.1,
        "b_yellow_blue": 138.4,
        "red_pink_ratio": 0.42
      },
      "recommendation": "Image quality is optimal for analysis."
    },
    "message": "Image successfully uploaded and evaluated."
  }
  ```

### `POST /api/tongue/analyze/{image_id}`
Executes the full pipeline: Preprocessing -> U-Net Segmentation -> Multi-Task EfficientNetV2 -> Grad-CAM XAI -> Gemini RAG Insights -> PDF Generation.
- **Query Parameters:** `language` (optional, default `"en"` or `"te"`)
- **Response (200 OK):** Full analysis report including image artifact URLs, multi-task predictions, calibrated confidences, and structured LLM report.

### `GET /api/tongue/result/{analysis_id}`
Retrieves a previously computed analysis and report.

---

## 3. AI & Chat Services (`/api/ai`)

### `POST /api/ai/insights/{analysis_id}`
Re-generates structured medical insights in a chosen language (`en` or `te`).

### `POST /api/ai/chat`
Conversational clinical assistant grounded in RAG evidence and user analysis.
- **Request Body (JSON):**
  ```json
  {
    "message": "What does a white coating indicate?",
    "analysis_id": 4,
    "language": "en",
    "history": []
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "response": "A white coating on the dorsum typically represents...",
    "language": "en",
    "retrieved_sources": ["British Dental Journal & Journal of Oral Pathology"],
    "medical_disclaimer": "IMPORTANT MEDICAL DISCLAIMER: This tool is educational..."
  }
  ```

---

## 4. History & Reports Endpoints (`/api/history`, `/api/reports`)

### `GET /api/history`
Returns array of user's past analyses with thumbnails and feature summaries.

### `DELETE /api/history/{analysis_id}`
Permanently deletes an individual analysis record and associated image files.

### `GET /api/reports/{analysis_id}/download`
Downloads the compiled ReportLab PDF health report with image previews, tables, and safety disclaimers.
