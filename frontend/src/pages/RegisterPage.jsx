import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, User, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consentDisclaimer, setConsentDisclaimer] = useState(true);
  const [consentRetention, setConsentRetention] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!consentDisclaimer) {
      setError('You must accept the educational disclaimer before registering.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, consentDisclaimer, consentRetention);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. This email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-7 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 mx-auto flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Patient Account</h2>
          <p className="text-xs text-slate-500">Access secure computer vision analysis and educational tongue health reports</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {error.toLowerCase().includes('already') && (
              <div className="pt-1">
                <Link
                  to={`/login?email=${encodeURIComponent(email)}`}
                  className="font-bold text-sky-700 hover:text-sky-800 underline inline-flex items-center gap-1"
                >
                  Already registered with this email? Click here to Log In &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. / Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="pt-2 space-y-2.5 text-xs text-slate-600">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={consentDisclaimer}
                onChange={(e) => setConsentDisclaimer(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>
                I acknowledge that this system is strictly an <strong>educational tool</strong> and does not constitute 
                a clinical diagnosis or medication prescription.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={consentRetention}
                onChange={(e) => setConsentRetention(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>
                I agree to the processing of tongue images for computer vision analysis with user-controlled data retention.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md shadow-sky-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
