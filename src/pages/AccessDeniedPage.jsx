import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#07352d] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-float border border-[#D9E9E8] text-center">
        {/* Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5">
          <ShieldAlert className="w-7 h-7" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
          Access Restricted
        </h1>
        <p className="text-xs text-amber-700 font-mono tracking-wider uppercase mb-5">
          Role Authorization Boundary (403)
        </p>

        {/* Context info */}
        <div className="p-4 bg-[#f8fbfb] border border-slate-200 rounded-2xl text-left mb-6 text-xs text-slate-700 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Authenticated User:</span>
            <span className="font-bold text-slate-900">{currentUser?.name || 'Staff User'}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Active Role:</span>
            <span className="font-semibold text-[#008C83]">
              {currentUser?.role === 'admin' ? 'Super Administrator' : 'Branch Staff'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Assigned Branch:</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#008C83]" />
              {currentUser?.branchName || 'Single Branch Scope'}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          This administration section requires Head Office Super Administrator privileges.
        </p>

        {/* Navigation CTAs */}
        <div className="space-y-2.5">
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out & Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
