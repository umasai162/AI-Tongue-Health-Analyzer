import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  User, 
  Mail, 
  Shield, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Languages, 
  Clock,
  ShieldCheck
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [retentionDays, setRetentionDays] = useState('30');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/auth/profile', { name });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update profile.');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/api/auth/account');
      logout();
      navigate('/');
    } catch (err) {
      alert('Failed to delete account.');
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Patient Profile & Data Controls
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your account credentials, image retention preferences, and health data isolation.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes have been successfully updated.</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="medical-card bg-white p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
            <p className="text-xs text-slate-500">Your clinical profile credentials</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Account identity key cannot be modified.</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Image Retention & Privacy Controls */}
      <div className="medical-card bg-white p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Data Isolation & Image Retention</h3>
            <p className="text-xs text-slate-500">Configure how long tongue images remain in storage</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-700">
          <div>
            <label className="block font-semibold mb-1">Image Retention Policy</label>
            <select
              value={retentionDays}
              onChange={(e) => setRetentionDays(e.target.value)}
              className="w-full sm:w-72 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
            >
              <option value="30">Retain for 30 Days (Default)</option>
              <option value="90">Retain for 90 Days</option>
              <option value="0">Ephemeral (Delete image immediately after report generation)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Controls when non-active segmentation masks and raw images are purged from server storage.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] text-slate-600">
              Active Consents: Educational Non-Diagnostic Acknowledgment (Granted) • HIPAA Privacy Isolation (Granted).
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="medical-card bg-rose-50/50 border-rose-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-900">Danger Zone: Permanent Account Deletion</h3>
            <p className="text-xs text-rose-700">Irreversibly delete your account, images, reports, and history.</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Once you delete your account, all associated tongue images, segmentation overlays, and clinical reports 
          will be permanently wiped from the database. This action cannot be undone.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Account & Data</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Confirm Account Deletion</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete your account and all associated tongue analysis files?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                {deleting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
