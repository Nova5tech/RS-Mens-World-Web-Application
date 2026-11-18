import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  Megaphone,
  BarChart3,
  ShieldCheck,
  Crown,
  Store,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/authService.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sessionExpired } = useAuth();

  const demoAccounts = authService.getDemoAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState('acc-admin');
  const [pin, setPin] = useState('1000');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const pinInputRef = useRef(null);

  const handleSelectAccount = (accountId) => {
    setSelectedAccountId(accountId);
    setErrorMessage('');
    const acc = demoAccounts.find(a => a.id === accountId);
    if (acc && acc.demoPinHint) {
      setPin(acc.demoPinHint);
    } else {
      setPin('');
    }
    if (pinInputRef.current) {
      pinInputRef.current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedAccountId) {
      setErrorMessage('Please select an authorized account.');
      return;
    }
    if (!pin.trim()) {
      setErrorMessage('Please enter your 4–6 digit PIN or password.');
      if (pinInputRef.current) pinInputRef.current.focus();
      return;
    }

    try {
      setLoading(true);
      await login({ accountId: selectedAccountId, pin: pin.trim() });
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden bg-[#07352d] font-sans selection:bg-[#38d996]/30 selection:text-white">
      {/* Background Retail Boutique Image on the Right/Center of the canvas */}
      <div
        className="absolute inset-y-0 right-1/4 w-1/2 bg-cover bg-center pointer-events-none opacity-25 mix-blend-screen hidden lg:block"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80')",
          maskImage: 'linear-gradient(to right, transparent, black 30%, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 30%, black 80%, transparent)',
        }}
      />

      {/* Atmospheric Deep Forest Teal Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#07352d] via-[#094137] to-[#04241e] opacity-95 pointer-events-none" />

      {/* Sweeping Organic Waves at the Bottom matching reference image */}
      <div className="absolute -bottom-6 left-0 right-0 h-80 pointer-events-none select-none overflow-hidden">
        <svg
          viewBox="0 0 1440 360"
          className="w-full h-full"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Back Wave */}
          <path
            d="M0,180 C320,300 480,80 840,240 C1120,360 1320,160 1440,220 L1440,360 L0,360 Z"
            fill="#0c4a3e"
            fillOpacity="0.55"
          />
          {/* Middle Wave */}
          <path
            d="M0,240 C280,120 540,320 900,160 C1200,40 1360,260 1440,200 L1440,360 L0,360 Z"
            fill="#126857"
            fillOpacity="0.45"
          />
          {/* Front Light Mint/Teal Accent Wave */}
          <path
            d="M0,300 C360,220 620,340 1020,180 C1260,80 1380,240 1440,220 L1440,360 L0,360 Z"
            fill="#2ba58c"
            fillOpacity="0.30"
          />
        </svg>
      </div>

      {/* Main Two-Column Container */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10 py-6">
        {/* LEFT COLUMN: Brand, Headline, Feature Highlights & Security Trust */}
        <div className="lg:col-span-7 xl:col-span-7 text-white space-y-7 px-2 sm:px-4">
          {/* Logo with Hanger Icon matching reference image */}
          <div className="flex items-center gap-3.5">
            {/* Coat Hanger SVG Icon */}
            <svg
              className="w-10 h-10 text-[#38d996] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a2.5 2.5 0 0 0-2.5 2.5c0 .9.5 1.7 1.3 2.1L2 14.5A2 2 0 0 0 3.5 18h17a2 2 0 0 0 1.5-3.5L13.2 6.6c.8-.4 1.3-1.2 1.3-2.1A2.5 2.5 0 0 0 12 2z" />
              <line x1="2" y1="18" x2="22" y2="18" />
            </svg>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none">
                RS Mens World
              </h1>
              <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-[#5fe3ab] uppercase font-bold mt-1">
                MULTI-BRANCH RETAIL &amp; CUSTOMER ENGAGEMENT
              </p>
            </div>
          </div>

          {/* Headline matching screenshot */}
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Manage Customers, Leads
            </h2>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              and Campaigns — Across
            </h2>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#38d996] tracking-tight leading-tight">
              All Branches
            </h2>
          </div>

          {/* 4 Feature Badges matching reference screenshot */}
          <div className="space-y-4 pt-1 max-w-lg">
            {/* 1. AI Chatbot */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0d4f43] border border-[#176a5b] flex items-center justify-center text-[#38d996] shrink-0 shadow-sm">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">AI Chatbot</h3>
                <p className="text-xs text-slate-300">Automated customer support &amp; enquiries</p>
              </div>
            </div>

            {/* 2. Lead Generation */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0d4f43] border border-[#176a5b] flex items-center justify-center text-[#38d996] shrink-0 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">Lead Generation</h3>
                <p className="text-xs text-slate-300">Capture, track and convert more leads</p>
              </div>
            </div>

            {/* 3. WhatsApp Campaigns */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0d4f43] border border-[#176a5b] flex items-center justify-center text-[#38d996] shrink-0 shadow-sm">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">WhatsApp Campaigns</h3>
                <p className="text-xs text-slate-300">Targeted offers and customer updates</p>
              </div>
            </div>

            {/* 4. Reports & Insights */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0d4f43] border border-[#176a5b] flex items-center justify-center text-[#38d996] shrink-0 shadow-sm">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">Reports &amp; Insights</h3>
                <p className="text-xs text-slate-300">Branch-wise performance and growth</p>
              </div>
            </div>
          </div>

          {/* Bottom Trust Line */}
          <div className="flex items-center gap-2 pt-2 text-xs font-medium text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-[#38d996]" />
            <span>Secure</span>
            <span className="text-emerald-500">•</span>
            <span>Role-based Access</span>
            <span className="text-emerald-500">•</span>
            <span>Multi-branch</span>
          </div>
        </div>

        {/* RIGHT COLUMN: White Floating Sign-In Card matching reference image */}
        <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end">
          <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-2xl max-w-lg w-full border border-slate-100 text-slate-800">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Sign In
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Choose your account and enter your PIN to continue.
              </p>
            </div>

            {/* Session Expired Notice */}
            {sessionExpired && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Your previous session has expired. Please sign in again.</span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block">Authentication Error</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account Selection 2-Column Grid matching reference screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoAccounts.map(account => {
                  const isSelected = selectedAccountId === account.id;
                  const isSuperAdmin = account.role === 'admin';

                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => handleSelectAccount(account.id)}
                      className={`text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#e2f9ed] border-2 border-[#34d399] shadow-xs'
                          : 'bg-white border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Icon */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'text-[#065f46]'
                              : 'bg-[#ccfbf1] text-[#0f766e]'
                          }`}
                        >
                          {isSuperAdmin ? (
                            <Crown className="w-5 h-5 text-[#047857]" />
                          ) : (
                            <Store className="w-4 h-4 text-[#0f766e]" />
                          )}
                        </div>

                        {/* Title & Branch Subtitle */}
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {account.name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {account.displaySubtitle}
                          </div>
                        </div>
                      </div>

                      {/* Selected green checkmark matching screenshot */}
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-[#059669] fill-[#059669] text-white shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* PIN / Password Input */}
              <div className="pt-2">
                <label
                  htmlFor="login-pin"
                  className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2"
                >
                  PIN / Password
                </label>
                <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:border-[#074c41] focus-within:ring-2 focus-within:ring-[#074c41]/20 transition-all">
                  <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    id="login-pin"
                    ref={pinInputRef}
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={8}
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="Enter 4–6 digit PIN or password"
                    className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none font-sans"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-slate-400 hover:text-slate-600 transition-colors ml-2"
                    aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In Button matching reference screenshot */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 px-6 rounded-xl bg-[#074c41] hover:bg-[#095c4f] active:bg-[#053a31] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Subtle Demo Testing Hint */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
              Demo PIN: <span className="font-semibold text-slate-700 font-mono">1000</span> for Super Admin ·{' '}
              <span className="font-semibold text-slate-700 font-mono">1111–4444</span> for Branch Users
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
