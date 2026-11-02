import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Upload, 
  History, 
  MessageSquare, 
  User as UserIcon, 
  Menu, 
  X, 
  Sparkles
} from 'lucide-react';

export const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'New Analysis', path: '/upload', icon: Upload },
    { name: 'History', path: '/history', icon: History },
    { name: 'AI Chatbot', path: '/chat', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-sky-700 bg-clip-text text-transparent block leading-tight">
                TongueAI
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Health Analyzer
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Badge */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <Link 
                to="/profile"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center border border-sky-200">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">{user?.name || 'Patient'}</p>
                  <p className="text-[10px] text-slate-500">Active Profile</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <Icon className="w-5 h-5 text-sky-600" />
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <UserIcon className="w-5 h-5 text-sky-600" />
              Profile & Settings
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
