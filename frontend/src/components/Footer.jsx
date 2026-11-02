import React from 'react';
import { AlertTriangle, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      
      {/* Prominent Medical Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 uppercase tracking-wider font-bold">Important Medical Notice:</strong>{' '}
            AI Tongue Health Analyzer is strictly an educational computer vision and information tool. It does NOT provide clinical 
            diagnoses, medical prescriptions, or treatment plans. Any visual observations must be correlated with professional 
            in-person examination by a licensed medical physician, dentist, or oral specialist.
          </p>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold text-sm">
                T
              </div>
              <span className="text-lg font-bold text-white tracking-tight">AI Tongue Health Analyzer</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Bridging advanced biomedical Computer Vision (U-Net segmentation, CLAHE, Multi-Task EfficientNetV2, Grad-CAM XAI) 
              with Evidence-grounded Retrieval-Augmented Generation (RAG) and Gemini LLM.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>HIPAA-inspired local data isolation & privacy compliance</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">AI & Medical Science</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>U-Net Lingual Segmentation</li>
              <li>Multi-Task EfficientNetV2</li>
              <li>Grad-CAM Visual Explainability</li>
              <li>Clinical RAG Vector Retrieval</li>
              <li>Gemini Multilingual Synthesis</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Languages & Ethics</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>English (EN) & Telugu (తెలుగు)</li>
              <li>Educational Oral Health Guide</li>
              <li>Zero Medication Prescribing</li>
              <li>Emergency Triage Guidelines</li>
              <li>User Consent & Data Retention</li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AI Tongue Health Analyzer. Non-Diagnostic Health Education System.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for AI & Healthcare Research
          </p>
        </div>
      </div>

    </footer>
  );
};
