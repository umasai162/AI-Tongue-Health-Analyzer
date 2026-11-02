import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  History, 
  Trash2, 
  Eye, 
  Download, 
  Search, 
  Upload, 
  Calendar, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/history');
      setHistory(res.data);
    } catch (err) {
      setError('Failed to load analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`/api/history/${id}`);
      setHistory((prev) => prev.filter((item) => item.analysis_id !== id));
      setDeleteId(null);
    } catch (err) {
      alert('Failed to delete analysis record.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    const term = searchTerm.toLowerCase();
    const idMatch = item.analysis_id.toString().includes(term);
    const colorMatch = item.features_summary.color?.toLowerCase().includes(term);
    const coatingMatch = item.features_summary.coating?.toLowerCase().includes(term);
    return idMatch || colorMatch || coatingMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analysis History & Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chronological log of all previous tongue computer vision scans and clinical reports.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors self-start"
        >
          <Upload className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, color or coating..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-xs"
          />
        </div>

        <span className="text-xs text-slate-500">
          Showing {filteredHistory.length} of {history.length} analyses
        </span>
      </div>

      {/* History Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Retrieving records from database...</p>
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => (
            <div key={item.analysis_id} className="medical-card bg-white p-5 space-y-4 flex flex-col justify-between">
              
              <div className="space-y-3">
                {/* Thumbnail */}
                <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-200">
                  <img
                    src={item.thumbnail_url}
                    alt="Analysis thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                    #{item.analysis_id}
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                    {item.status.toUpperCase()}
                  </span>
                </div>

                {/* Meta details */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Features Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Color</span>
                    <span className="font-bold text-slate-800 truncate block">{item.features_summary.color}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Coating</span>
                    <span className="font-bold text-slate-800 truncate block">{item.features_summary.coating}</span>
                  </div>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <Link
                  to={`/results/${item.analysis_id}`}
                  className="flex-1 py-2 px-3 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </Link>

                <a
                  href={`/api/reports/${item.analysis_id}/download`}
                  download
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setDeleteId(item.analysis_id)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="medical-card bg-white p-12 text-center space-y-3">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm ? 'No analysis matched your search query.' : 'You have not uploaded any tongue images for analysis yet.'}
          </p>
          {!searchTerm && (
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold text-xs hover:bg-sky-700"
            >
              Start First Analysis
            </Link>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Analysis Record #{deleteId}?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This action will permanently delete this analysis and all associated segmentation masks and Grad-CAM visualizations.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
