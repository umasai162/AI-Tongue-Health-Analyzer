import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ExternalLink, 
  AlertTriangle, 
  Languages, 
  HelpCircle,
  ShieldCheck,
  Loader2
} from 'lucide-react';

export const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const initialAnalysisId = searchParams.get('analysisId') || '';

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Tongue Health Educational Assistant. I can help explain lingual features, hydration indicators, oral hygiene best practices, or help prepare questions for your dentist. How can I assist you today?',
      sources: ['Oral Health Clinical Guidelines']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(initialAnalysisId);
  const [analysesList, setAnalysesList] = useState([]);
  const [language, setLanguage] = useState('en');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load user's analyses for context selector
    const fetchAnalyses = async () => {
      try {
        const res = await api.get('/api/history');
        setAnalysesList(res.data);
      } catch (err) {
        console.error('Failed to load analyses list:', err);
      }
    };
    fetchAnalyses();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyContext = messages.map((m) => ({ role: m.role, content: m.content }));
      const payload = {
        message: query,
        analysis_id: selectedAnalysisId ? parseInt(selectedAnalysisId) : null,
        language: language,
        history: historyContext
      };

      const res = await api.post('/api/ai/chat', payload);
      const botMsg = {
        role: 'assistant',
        content: res.data.response,
        sources: res.data.retrieved_sources
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error connecting to the clinical intelligence service. Please check your network or try again.',
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    { en: 'Explain my tongue analysis.', te: 'నా నాలుక విశ్లేషణను వివరించండి.' },
    { en: 'What does a white coating mean?', te: 'నాలుకపై తెల్లటి పూత అంటే ఏమిటి?' },
    { en: 'Explain this report in Telugu.', te: 'ఈ నివేదికను తెలుగులో వివరించండి.' },
    { en: 'What questions should I ask my doctor?', te: 'నేను నా దంత వైద్యుడిని ఏ ప్రశ్నలు అడగాలి?' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 h-[calc(100vh-80px)] flex flex-col">
      
      {/* Top Controls Header */}
      <div className="medical-card bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">AI Oral Health Conversational Assistant</h1>
            <p className="text-[11px] text-slate-500">RAG Literature Grounded • English & Telugu</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Analysis Context Selector */}
          <select
            value={selectedAnalysisId}
            onChange={(e) => setSelectedAnalysisId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-hidden"
          >
            <option value="">General Knowledge (No Scan)</option>
            {analysesList.map((a) => (
              <option key={a.analysis_id} value={a.analysis_id}>
                Analysis #{a.analysis_id} ({a.features_summary?.color || 'Scan'})
              </option>
            ))}
          </select>

          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                language === 'en' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                language === 'te' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              తెలుగు
            </button>
          </div>
        </div>
      </div>

      {/* Safety Notice Strip */}
      <div className="bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl flex items-center gap-2 text-[11px] text-amber-800 shrink-0">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Educational assistant only. Does not diagnose diseases or prescribe medications.</span>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white rounded-br-xs'
                  : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-bl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Source citations for assistant responses */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block w-full">
                    Grounded Medical Sources:
                  </span>
                  {msg.sources.map((src, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1 text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                    >
                      <ExternalLink className="w-2.5 h-2.5 text-sky-600" />
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                U
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
              <span>Retrieving medical literature & formulating explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
          <HelpCircle className="w-3.5 h-3.5" /> Prompt suggestions:
        </span>
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(language === 'te' ? q.te : q.en)}
            className="text-[11px] bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0 font-medium transition-colors shadow-2xs"
          >
            {language === 'te' ? q.te : q.en}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="shrink-0 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            language === 'te'
              ? 'నాలుక ఆరోగ్యం లేదా పూత గురించి ప్రశ్న అడగండి...'
              : 'Ask a question about your tongue analysis or oral hygiene...'
          }
          className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-sm"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="absolute right-2 top-2 p-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-40 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
