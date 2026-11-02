import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Activity, 
  Upload, 
  History, 
  MessageSquare, 
  FileText, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Sparkles,
  Layers,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/api/history');
        setHistory(res.data);
      } catch (err) {
        setError('Failed to load analysis history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalAnalyses = history.length;
  const recentAnalysis = history[0] || null;
  const lastDate = recentAnalysis 
    ? new Date(recentAnalysis.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'None yet';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-400/30">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>AI Clinical Dashboard Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Patient'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Monitor your lingual characteristics over time, check hydration and oral biofilm trends, 
              and review AI-assisted educational evaluations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>New Analysis</span>
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>AI Health Chatbot</span>
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="medical-card p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Analyses</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{totalAnalyses}</p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Multi-task models active
          </p>
        </div>

        <div className="medical-card p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Last Analysis Date</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-2 truncate">{lastDate}</p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-500" /> Stored in encrypted DB
          </p>
        </div>

        <div className="medical-card p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Latest Coating Pattern</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-extrabold text-slate-900 mt-2 truncate">
            {recentAnalysis?.features_summary?.coating || 'Awaiting upload'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Dorsal biofilm assessment</p>
        </div>

        <div className="medical-card p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Medical Safety Status</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-extrabold text-emerald-700 mt-2">Guardrails Enforced</p>
          <p className="text-[11px] text-slate-400 mt-1">RAG Grounded • Non-Diagnostic</p>
        </div>

      </div>

      {/* Main Grid: Recent Highlight & Quick History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Analysis Highlight */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Latest Tongue Assessment</h2>
            {recentAnalysis && (
              <Link 
                to={`/results/${recentAnalysis.analysis_id}`}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <span>Full Details</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {recentAnalysis ? (
            <div className="medical-card bg-white p-5 space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-200">
                <img 
                  src={recentAnalysis.thumbnail_url} 
                  alt="Recent tongue analysis" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                  Analysis #{recentAnalysis.analysis_id}
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                  {recentAnalysis.status.toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Color</span>
                  <span className="font-bold text-slate-800">{recentAnalysis.features_summary.color}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Coating</span>
                  <span className="font-bold text-slate-800">{recentAnalysis.features_summary.coating}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Texture</span>
                  <span className="font-bold text-slate-800">{recentAnalysis.features_summary.texture}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Shape</span>
                  <span className="font-bold text-slate-800">{recentAnalysis.features_summary.shape}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link
                  to={`/results/${recentAnalysis.analysis_id}`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs text-center shadow-xs transition-colors"
                >
                  View Interactive Results
                </Link>
                <a
                  href={`/api/reports/${recentAnalysis.analysis_id}/download`}
                  download
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Download PDF Health Report"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="medical-card bg-white p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Analysis Recorded Yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Upload your first tongue photo to evaluate oral coating, color distribution, and lingual health features.
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-xs shadow-xs hover:bg-sky-700 transition-colors"
              >
                Upload First Image
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Recent History List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Analysis History</h2>
            <Link to="/history" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="medical-card bg-white overflow-hidden divide-y divide-slate-100">
            {history.length > 0 ? (
              history.slice(0, 5).map((item) => (
                <div key={item.analysis_id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.thumbnail_url} 
                      alt="Thumbnail" 
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">Analysis #{item.analysis_id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-100">
                          {item.features_summary.color}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Coating: {item.features_summary.coating} • {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/results/${item.analysis_id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-semibold text-xs transition-colors"
                    >
                      Report
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No history entries found. Run your first analysis to see past reports.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
