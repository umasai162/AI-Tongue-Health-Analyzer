import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Lightbulb, 
  Sun, 
  Maximize2, 
  ShieldAlert, 
  Languages, 
  Sparkles,
  Loader2,
  AlertTriangle,
  Flame,
  Layers,
  ChevronRight
} from 'lucide-react';

export const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState('');
  const [qualityWarning, setQualityWarning] = useState(null); // { message, imageId }
  
  // Staged Analysis Pipeline State
  const [analyzing, setAnalyzing] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const stages = [
    { title: 'Upload & Quality Validation', desc: 'Checking blur (Laplacian variance), lightness & resolution' },
    { title: 'CLAHE Illumination Preprocessing', desc: 'Enhancing L-channel contrast while preserving true colors' },
    { title: 'U-Net Semantic Segmentation', desc: 'Isolating tongue body and extracting mucosal ROI' },
    { title: 'Multi-Task Feature Classification', desc: 'Analyzing Color, Coating, Texture, Fissures, and Teeth Marks' },
    { title: 'Grad-CAM Explainable AI', desc: 'Generating activation heatmaps for algorithmic transparency' },
    { title: 'RAG Retrieval & Gemini LLM Insights', desc: 'Grounding insights in medical literature (English & Telugu)' },
    { title: 'PDF Health Report Generation', desc: 'Compiling structured reportLab medical report' }
  ];

  const sampleImages = [
    {
      title: 'Normal Pink',
      subtitle: 'Healthy mucosa & thin coating',
      path: '/samples/normal_pink.jpg',
      badge: 'Healthy Normal',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      title: 'Coated Dorsum',
      subtitle: 'Thick white / yellowish furring',
      path: '/samples/coated_white.jpg',
      badge: 'Coating',
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      title: 'Fissured Surface',
      subtitle: 'Deep median & lateral grooves',
      path: '/samples/fissured_tongue.jpg',
      badge: 'Fissures',
      color: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    {
      title: 'Scalloped Borders',
      subtitle: 'Teeth marks on lateral margins',
      path: '/samples/scalloped_edges.jpg',
      badge: 'Teeth Marks',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ];

  const handleSelectSample = async (sample) => {
    setError('');
    setQualityWarning(null);
    try {
      const response = await fetch(sample.path);
      const blob = await response.blob();
      const sampleFile = new File([blob], `${sample.title.toLowerCase().replace(/ /g, '_')}.jpg`, { type: 'image/jpeg' });
      validateAndSetFile(sampleFile);
    } catch (err) {
      console.error('Error loading sample image:', err);
      setError('Could not load sample picture.');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    setQualityWarning(null);
    if (!selectedFile) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid image (JPG, JPEG, PNG, or WEBP).');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Webcam Camera Capture
  const startCamera = async () => {
    setError('');
    setQualityWarning(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Unable to access webcam. Please verify browser permissions or select one of the neat sample images.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      const capturedFile = new File([blob], 'camera_tongue_capture.jpg', { type: 'image/jpeg' });
      validateAndSetFile(capturedFile);
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
    setError('');
    setQualityWarning(null);
  };

  // Execute Analysis Pipeline given an imageId
  const executeAnalysisPipeline = async (imageId) => {
    setAnalyzing(true);
    setError('');
    setQualityWarning(null);
    setActiveStage(1);

    const interval = setInterval(() => {
      setActiveStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 800);

    try {
      const analyzeRes = await api.post(`/api/tongue/analyze/${imageId}?language=${language}`);
      clearInterval(interval);
      setActiveStage(stages.length - 1);
      setTimeout(() => {
        navigate(`/results/${analyzeRes.data.id}`);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setAnalyzing(false);
      setError(err.response?.data?.detail || 'Analysis pipeline encountered an error. Please try another image.');
    }
  };

  // Initial Upload Handler
  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select or capture a tongue photo first.');
      return;
    }

    setAnalyzing(true);
    setError('');
    setQualityWarning(null);
    setActiveStage(0);

    try {
      // 1. Upload File
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/api/tongue/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const imageId = uploadRes.data.image_id;
      const quality = uploadRes.data.quality_assessment;

      // If quality check suggests minor blur/suboptimal lighting, provide advisory & option to proceed
      if (!quality.is_acceptable) {
        setAnalyzing(false);
        setQualityWarning({
          message: quality.recommendation || 'The photo has softer focus or lighting variance.',
          imageId: imageId
        });
        return;
      }

      // If acceptable, continue straight to analysis
      await executeAnalysisPipeline(imageId);

    } catch (err) {
      setAnalyzing(false);
      setError(err.response?.data?.detail || 'Upload failed. Please check network connection or try another picture.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title & Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tongue Image Upload & Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Capture, upload, or choose a clinical sample photo to initiate the computer vision and deep learning pipeline.
          </p>
        </div>

        {/* Language Selection Toggle */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs self-start">
          <Languages className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-semibold text-slate-700">Report Language:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-900 focus:outline-hidden"
          >
            <option value="en">English</option>
            <option value="te">తెలుగు (Telugu)</option>
          </select>
        </div>
      </div>

      {/* Neat Clinical Sample Images Gallery */}
      <div className="medical-card bg-white p-5 space-y-3 border-sky-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Try Neat Clinical Sample Pictures (1-Click Instant Analysis)</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Click any picture below to test</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {sampleImages.map((sample, sIdx) => (
            <button
              key={sIdx}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="group text-left p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 transition-all flex flex-col justify-between"
            >
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-900 mb-2 relative">
                <img
                  src={sample.path}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${sample.color}`}>
                  {sample.badge}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-sky-700">{sample.title}</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">{sample.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quality Warning with "Proceed Anyway" Option */}
      {qualityWarning && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-800">Image Quality Advisory Notice</span>
              <p className="mt-0.5 leading-relaxed text-slate-700">{qualityWarning.message}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                You can either proceed with analysis using this photo, or select one of the neat sample images above.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1 pl-7">
            <button
              type="button"
              onClick={() => executeAnalysisPipeline(qualityWarning.imageId)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Proceed With Analysis Anyway</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => { setQualityWarning(null); removeImage(); }}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
            >
              Retake / Upload New Picture
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Image Assessment Alert</span>
            <p className="leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Upload Area vs Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upload / Camera Card */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="medical-card bg-white p-6 space-y-5">
            
            {/* Live Camera View */}
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex flex-col items-center justify-center border-2 border-sky-400">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                
                {/* Tongue alignment guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-40 h-52 border-2 border-dashed border-cyan-400/80 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <span className="text-[10px] text-cyan-200 bg-slate-900/70 px-2 py-0.5 rounded-full">
                      Align Tongue Here
                    </span>
                  </div>
                </div>

                {/* Camera Actions Bar */}
                <div className="absolute bottom-4 flex items-center gap-4">
                  <button
                    onClick={capturePhoto}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
                  >
                    Take Photo
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : preview ? (
              /* Image Preview Card */
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-200 group">
                <img src={preview} alt="Tongue Preview" className="w-full h-full object-contain" />
                <button
                  onClick={removeImage}
                  disabled={analyzing}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-xs font-medium">
                  {file?.name} ({(file?.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              </div>
            ) : (
              /* Drag & Drop Zone */
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-sky-500 bg-sky-50/60 scale-[1.01]' 
                    : 'border-slate-300 hover:border-sky-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileInput}
                  className="hidden"
                />
                
                <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 mx-auto flex items-center justify-center mb-4 shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>

                <h3 className="text-sm font-bold text-slate-800">
                  Drag and drop your tongue image here
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  or <span className="font-semibold text-sky-600">browse files</span> from your device
                </p>
                <p className="text-[11px] text-slate-400 mt-3">
                  Supported formats: JPG, JPEG, PNG, WEBP (Maximum size: 10 MB)
                </p>
              </div>
            )}

            {/* Bottom Controls */}
            {!isCameraActive && (
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                {!preview && (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4 text-sky-600" />
                    Use Device Camera
                  </button>
                )}

                <button
                  type="button"
                  disabled={!file || analyzing}
                  onClick={handleAnalyze}
                  className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Clinical Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Tongue Features</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

          </div>

          {/* Staged Processing Progress Display */}
          {analyzing && (
            <div className="medical-card bg-white p-6 space-y-4 border-sky-200 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-sky-600 animate-ping" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Live Processing Pipeline
                  </span>
                </div>
                <span className="text-xs font-bold text-sky-600">
                  Stage {activeStage + 1} of {stages.length}
                </span>
              </div>

              <div className="space-y-3">
                {stages.map((stage, idx) => {
                  const isDone = idx < activeStage;
                  const isCurrent = idx === activeStage;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-2.5 rounded-xl text-xs transition-all ${
                        isCurrent
                          ? 'bg-sky-50 border border-sky-200'
                          : isDone
                          ? 'text-slate-600'
                          : 'text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className={`font-bold ${isCurrent ? 'text-sky-900' : isDone ? 'text-slate-800' : 'text-slate-500'}`}>
                          {stage.title}
                        </p>
                        <p className="text-[11px] text-slate-500">{stage.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Visual Photo Guidelines Card */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="medical-card bg-white p-6 space-y-4">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
              <Lightbulb className="w-5 h-5 text-sky-600" />
              <span>Image Capture Guidelines</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              To ensure high computational confidence, adhere to the standard clinical lingual photography protocol:
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Natural / Diffuse Lighting</h4>
                  <p className="text-[11px] text-slate-500">
                    Use bright, indirect daylight or neutral indoor lighting. Avoid harsh direct phone flash which overexposes coating.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Relaxed Extension</h4>
                  <p className="text-[11px] text-slate-500">
                    Stick out the tongue naturally without straining or curling. The dorsal surface and tip should be fully visible.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">No Filters or Editing</h4>
                  <p className="text-[11px] text-slate-500">
                    Avoid beauty filters, color adjustments, or HDR effects that distort authentic CIE L*a*b* coloration.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Pre-Analysis Fasting Note</h4>
                  <p className="text-[11px] text-slate-500">
                    Recent consumption of coffee, tea, berries, or colored lozenges may temporarily dye the dorsal fur.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Privacy Notice */}
          <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
            <strong>Privacy Assurance:</strong> Uploaded images are stored securely in your private patient repository. 
            You retain 100% control and can permanently delete records from your dashboard or profile settings at any time.
          </div>

        </div>

      </div>

    </div>
  );
};
