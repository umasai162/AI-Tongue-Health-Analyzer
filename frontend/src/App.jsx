import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Home & Direct Access Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/register" element={<Navigate to="/dashboard" replace />} />

              {/* Clinical Routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/results/:analysisId" element={<ResultsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
