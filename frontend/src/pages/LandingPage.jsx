import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Upload, 
  Eye, 
  Cpu, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Database,
  Languages,
  Zap
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-sky-50/40 to-slate-50">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-sky-400/10 via-cyan-300/15 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Next-Gen Medical AI • Computer Vision & Gemini RAG</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                AI-Powered <span className="bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">Tongue Health</span> Analysis System
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Analyze oral characteristics using deep neural networks, U-Net semantic segmentation, 
                and multi-task classification. Gain understandable, evidence-grounded wellness insights 
                powered by Google Gemini and peer-reviewed medical RAG literature.
              </p>

              {/* Bullet Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Computer Vision Preprocessing (CLAHE)',
                  'U-Net Tongue Region Segmentation',
                  'Multi-Task Feature Classification',
                  'Explainable AI (Grad-CAM Heatmaps)',
                  'English & Telugu (తెలుగు) Explanations',
                  'One-Click Clinical PDF Reports'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/25 hover:shadow-lg transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Start Tongue Analysis
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-200 shadow-xs transition-colors"
                >
                  <Activity className="w-4 h-4 text-sky-600" />
                  View Dashboard
                </Link>
              </div>

              {/* Non-diagnostic badge */}
              <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Strictly educational screening tool • Not a medical diagnosis system</span>
              </div>

            </div>

            {/* Right Column: Interactive Diagnostic Mock Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                
                {/* Main Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 relative z-10 space-y-5">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Analysis Preview</h3>
                        <p className="text-[11px] text-slate-500">Live Multi-Task AI Pipeline</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Quality: Optimal
                    </span>
                  </div>

                  {/* Visual Grid Demo */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-100 rounded-xl p-2.5 border border-slate-200 text-center">
                      <div className="w-full h-24 rounded-lg bg-rose-200/80 flex items-center justify-center text-xs font-semibold text-rose-800 relative overflow-hidden">
                        <div className="w-16 h-20 rounded-full bg-rose-400/90 border-2 border-rose-300"></div>
                        <span className="absolute bottom-1 right-2 text-[9px] bg-slate-900/60 text-white px-1.5 py-0.5 rounded">
                          Original
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-700 mt-1.5">True Color Image</p>
                    </div>

                    <div className="bg-slate-100 rounded-xl p-2.5 border border-slate-200 text-center">
                      <div className="w-full h-24 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-semibold text-cyan-300 relative overflow-hidden">
                        <div className="w-16 h-20 rounded-full border-2 border-cyan-400 bg-cyan-950/40"></div>
                        <span className="absolute bottom-1 right-2 text-[9px] bg-cyan-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                          U-Net
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-700 mt-1.5">Segmented Mask</p>
                    </div>
                  </div>

                  {/* Detected Features Badge List */}
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-semibold text-slate-800 flex justify-between">
                      <span>Detected Characteristics</span>
                      <span className="text-sky-600 text-[11px]">7 Model Heads</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <p className="text-[10px] text-slate-500">Color</p>
                        <p className="font-semibold text-slate-800">Normal Pink (94%)</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <p className="text-[10px] text-slate-500">Coating</p>
                        <p className="font-semibold text-slate-800">Thin White (92%)</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <p className="text-[10px] text-slate-500">Texture</p>
                        <p className="font-semibold text-slate-800">Smooth / Normal</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <p className="text-[10px] text-slate-500">Explainability</p>
                        <p className="font-semibold text-cyan-700">Grad-CAM Ready</p>
                      </div>
                    </div>
                  </div>

                  {/* Gemini LLM Synthesis snippet */}
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-left">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      <span>Gemini 2.5 Flash Insight</span>
                    </div>
                    <p className="text-[11px] text-sky-900/80 leading-relaxed">
                      "Observation reflects balanced hydration and standard physiological filiform keratinization. 
                      Recommended routine dorsum cleaning."
                    </p>
                  </div>

                </div>

                {/* Decorative shadow layer */}
                <div className="absolute -inset-2 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-2xl opacity-10 blur-xl -z-10"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Step-by-Step Workflow</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2 mb-12">How AI Tongue Analysis Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left relative group hover:border-sky-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Image Acquisition</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload or capture a high-resolution photo. Built-in quality verification checks blur (Laplacian variance), 
                lightness, and oral visibility.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left relative group hover:border-sky-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">CLAHE & U-Net</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applies illumination correction to the L-channel of CIE LAB, denoises, and segments the precise tongue region 
                from lips and background.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left relative group hover:border-sky-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Multi-Task & Grad-CAM</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deep learning heads classify color, coating, texture, shape, and fissures. Grad-CAM heatmaps highlight 
                influential lingual regions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left relative group hover:border-sky-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">RAG & Gemini Insights</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Retrieves peer-reviewed oral medicine citations and generates structured insights in English or Telugu, 
                with a downloadable PDF report.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Advanced Capabilities</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 mb-4">Engineered for Medical AI Precision</h2>
            <p className="text-sm text-slate-600">
              A comprehensive architecture uniting computer vision, explainable artificial intelligence, 
              clinical literature retrieval, and ethical medical safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="medical-card p-6 bg-white space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Computer Vision Preprocessing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Adaptive histogram equalization (CLAHE) specifically on the L-channel preserves true mucosal color balance 
                while enhancing diagnostic papillary contrast.
              </p>
            </div>

            <div className="medical-card p-6 bg-white space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">U-Net Semantic Segmentation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deep neural convolutional encoder-decoder isolates lingual tissue with Dice loss optimization and produces 
                clear masks and contour overlays.
              </p>
            </div>

            <div className="medical-card p-6 bg-white space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Multi-Task Classification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Predicts 7 distinct anatomical features: color, coating thickness, surface texture, body shape, 
                fissures, teeth marks, and patches.
              </p>
            </div>

            <div className="medical-card p-6 bg-white space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Explainable AI (Grad-CAM)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates activation heatmaps that visually show which regions influenced the deep learning models, 
                eliminating black-box opacity.
              </p>
            </div>

            <div className="medical-card p-6 bg-white space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">RAG Medical Knowledge Retrieval</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Grounds all AI explanations in peer-reviewed oral medicine journals, dental anatomy guidelines, and 
                microbiome studies with explicit citations.
              </p>
            </div>

            <div className="medical-card p-6 bg-white space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">English & Telugu Support</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Native bilingual health reports and interactive AI chatbot in both English and Telugu (తెలుగు), 
                expanding accessibility for diverse communities.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Technology Stack Grid */}
      <section className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Built With Modern Biomedical AI Technologies</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-semibold text-slate-700">
            <span className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200">FastAPI (Python 3.11)</span>
            <span className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200">PyTorch (U-Net & EfficientNetV2)</span>
            <span className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200">OpenCV & Scikit-Image</span>
            <span className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200">Google Gemini (google-genai)</span>
            <span className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200">RAG Semantic Retrieval</span>
            <span className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200">React + Vite + Tailwind CSS</span>
            <span className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200">ReportLab PDF Engine</span>
          </div>
        </div>
      </section>

      {/* Medical Safety Disclaimer Callout */}
      <section className="py-12 bg-sky-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4 text-left">
            <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Human Clinical Examination Is Irreplaceable</h3>
              <p className="text-xs text-sky-200 leading-relaxed">
                This system provides visual screening and educational knowledge. It is not intended for self-diagnosis. 
                Always consult an oral specialist or doctor for clinical confirmation.
              </p>
            </div>
          </div>
          <Link
            to="/upload"
            className="shrink-0 px-6 py-3 rounded-xl bg-white text-sky-900 font-bold text-xs hover:bg-sky-50 transition-colors shadow-md"
          >
            Start Free Analysis
          </Link>
        </div>
      </section>

    </div>
  );
};
