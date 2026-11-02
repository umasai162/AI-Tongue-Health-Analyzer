import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { TongueHealthDashboard } from '../components/TongueHealthDashboard';

export const ResultsPage = () => {
  const { analysisId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [regeneratingLang, setRegeneratingLang] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/api/tongue/result/${analysisId}`);
        setData(res.data);
        setActiveLanguage(res.data.language || 'en');
      } catch (err) {
        setError('Failed to load analysis result. It may have been removed or does not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [analysisId]);

  const handleLanguageSwitch = async (newLang) => {
    if (newLang === activeLanguage || regeneratingLang) return;
    setRegeneratingLang(true);

    try {
      const res = await api.post(`/api/ai/insights/${analysisId}?language=${newLang}`);
      setData((prev) => ({
        ...prev,
        report: res.data.report_data,
        language: newLang,
        pdf_download_url: res.data.pdf_url
      }));
      setActiveLanguage(newLang);
    } catch (err) {
      console.error('Error switching language:', err);
    } finally {
      setRegeneratingLang(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-600">Loading tongue health dashboard #{analysisId}...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto my-16 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
        <h2 className="mt-4 text-lg font-bold text-slate-900">Analysis record not found</h2>
        <p className="mt-2 text-xs text-slate-500">{error || 'Requested report cannot be retrieved.'}</p>
        <Link
          to="/dashboard"
          className="mt-5 inline-block rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Return to dashboard
        </Link>
      </div>
    );
  }

  return (
    <TongueHealthDashboard
      data={data}
      activeLanguage={activeLanguage}
      onLanguageSwitch={handleLanguageSwitch}
      regeneratingLang={regeneratingLang}
    />
  );
};
