import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Store,
  Users,
  Megaphone,
  BarChart3,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Building2,
  ChevronDown,
  Check,
  ArrowLeft,
  Crown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { CANONICAL_BRANCHES } from '../config/branchConfig.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, sessionExpired } = useAuth();

  // Active Tab: 'branch' (default, matching master screenshot) or 'admin'
  const [activeTab, setActiveTab] = useState('branch');

  // Branch Selection State
  const [selectedBranchId, setSelectedBranchId] = useState('B1');
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  // Authentication Credentials
  const [pin, setPin] = useState('1111');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const dropdownRef = useRef(null);
  const pinInputRef = useRef(null);

  // If already authenticated, redirect to destination or root
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Map Branch ID to Synthetic Demo Account ID and default demo PIN
  const branchAccountMap = {
    B1: { accountId: 'acc-b1', demoPin: '1111' },
    B2: { accountId: 'acc-b2', demoPin: '2222' },
    B3: { accountId: 'acc-b3', demoPin: '3333' },
    B4: { accountId: 'acc-b4', demoPin: '4444' },
  };

  const selectedBranch =
    CANONICAL_BRANCHES.find(b => b.id === selectedBranchId) || CANONICAL_BRANCHES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsBranchDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Tab Switch
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    setIsBranchDropdownOpen(false);

    if (tab === 'admin') {
      setPin('1000');
    } else {
      const mapping = branchAccountMap[selectedBranchId];
      setPin(mapping?.demoPin || '1111');
    }
    if (pinInputRef.current) {
      pinInputRef.current.focus();
    }
  };

  // Handle Branch Selection
  const handleSelectBranch = (branchId) => {
    setSelectedBranchId(branchId);
    setIsBranchDropdownOpen(false);
    setErrorMessage('');

    const mapping = branchAccountMap[branchId];
    if (mapping) {
      setPin(mapping.demoPin);
    }
    if (pinInputRef.current) {
      pinInputRef.current.focus();
    }
  };

  // Handle Login Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    let accountId = 'acc-admin';
    if (activeTab === 'branch') {
      const mapping = branchAccountMap[selectedBranchId];
      if (!mapping) {
        setErrorMessage('Please select a valid branch.');
        return;
      }
      accountId = mapping.accountId;
    }

    if (!pin.trim()) {
      setErrorMessage('Please enter your 4–6 digit PIN or password.');
      if (pinInputRef.current) pinInputRef.current.focus();
      return;
    }

    try {
      setLoading(true);
      await login({ accountId, pin: pin.trim() });
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-hidden bg-[#003835] font-sans selection:bg-[#34d399]/30 selection:text-white">
      {/* Background Menswear Store Interior Image with Dark Teal Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-luminosity"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1600&q=80')",
        }}
      />

      {/* Atmospheric Deep Teal Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#002b28] via-[#004743] to-[#001f1d] opacity-95 pointer-events-none" />

      {/* Organic Mint Curved Swoop Ribbons at the bottom-left of canvas matching reference image */}
      <div className="absolute -bottom-10 -left-10 w-[950px] h-[550px] pointer-events-none select-none overflow-hidden hidden sm:block opacity-75">
        <svg
          viewBox="0 0 950 550"
          className="w-full h-full"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Back Deep Teal Curve */}
          <path
            d="M 0,380 C 250,500 480,240 760,420 C 880,500 950,460 950,550 L 0,550 Z"
            fill="#005a54"
            fillOpacity="0.4"
          />
          {/* Middle Mint Accent Curve */}
          <path
            d="M 0,440 C 280,360 520,520 820,380 C 900,340 950,400 950,550 L 0,550 Z"
            fill="#008C83"
            fillOpacity="0.35"
          />
          {/* Front Light Mint Vibrant Swoop */}
          <path
            d="M 0,500 C 320,440 560,540 860,390 C 910,360 950,410 950,550 L 0,550 Z"
            fill="#34d399"
            fillOpacity="0.25"
          />
        </svg>
      </div>

      {/* Large Decorative Mint Wave at bottom right curving upward */}
      <div className="absolute -bottom-24 right-0 w-[600px] h-[500px] pointer-events-none select-none overflow-hidden opacity-40 hidden lg:block">
        <svg
          viewBox="0 0 600 500"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 600,100 C 450,220 300,350 200,500 L 600,500 Z"
            fill="#34d399"
            fillOpacity="0.3"
          />
        </svg>
      </div>

      {/* Main Two-Column Split Container */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10 py-6">
        {/* LEFT COLUMN: Brand, Headline, Feature Highlights & Security Trust */}
        <div className="lg:col-span-7 xl:col-span-7 text-white space-y-7 px-2 sm:px-6">
          {/* Coat Hanger Logo + Brand Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#005a54]/60 border border-[#008C83]/40 flex items-center justify-center shrink-0 shadow-sm">
              <svg
                className="w-7 h-7 text-[#00e599]"
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
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none">
                RS Mens World
              </h1>
              <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] text-[#a8f0d0] uppercase font-bold mt-1.5">
                MULTI-BRANCH RETAIL &amp; CUSTOMER ENGAGEMENT
              </p>
            </div>
          </div>

          {/* Dynamic Headline matching reference screenshot */}
          <div className="space-y-1.5 pt-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {activeTab === 'branch' ? 'Branch Sign In' : 'Head Office Sign In'}
            </h2>
            <p className="text-sm sm:text-base text-[#a8f0d0]/90 font-medium">
              {activeTab === 'branch'
                ? 'Access your branch dashboard'
                : 'Access the central multi-branch management console'}
            </p>
          </div>

          {/* 4 Feature Badges matching reference screenshot */}
          <div className="space-y-4 pt-2 max-w-lg">
            {/* 1. Branch-wise Access */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#004d49] border border-[#006e68] flex items-center justify-center text-[#34d399] shrink-0 shadow-sm">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">Branch-wise Access</h3>
                <p className="text-xs text-slate-300">Manage your branch operations</p>
              </div>
            </div>

            {/* 2. Leads & Customers */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#004d49] border border-[#006e68] flex items-center justify-center text-[#34d399] shrink-0 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">Leads &amp; Customers</h3>
                <p className="text-xs text-slate-300">Track and engage customers</p>
              </div>
            </div>

            {/* 3. Campaigns */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#004d49] border border-[#006e68] flex items-center justify-center text-[#34d399] shrink-0 shadow-sm">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">Campaigns</h3>
                <p className="text-xs text-slate-300">Run WhatsApp campaigns</p>
              </div>
            </div>

            {/* 4. Branch Reports */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#004d49] border border-[#006e68] flex items-center justify-center text-[#34d399] shrink-0 shadow-sm">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">Branch Reports</h3>
                <p className="text-xs text-slate-300">View your branch performance</p>
              </div>
            </div>
          </div>

          {/* Bottom Trust Line with Check badge */}
          <div className="flex items-center gap-3 pt-3 text-xs sm:text-sm font-medium text-emerald-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#34d399]" />
              <span>Secure Login</span>
            </div>
            <span className="text-emerald-500">•</span>
            <span>Role-based Access</span>
            <span className="text-emerald-500">•</span>
            <span>Multi-branch</span>
          </div>
        </div>

        {/* RIGHT COLUMN: White Floating Card matching exact reference screenshot */}
        <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end">
          <div className="bg-white rounded-3xl sm:rounded-[36px] p-6 sm:p-9 lg:p-10 shadow-2xl max-w-lg w-full border border-slate-100 text-slate-800 relative z-20">
            {/* Top Segmented Navigation Tabs */}
            <div className="bg-[#f1f5f9] p-1.5 rounded-2xl flex items-center gap-1.5 mb-6">
              {/* Head Office (Admin) Tab */}
              <button
                type="button"
                onClick={() => handleTabChange('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#004F4C] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-transparent'
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Head Office (Admin)</span>
              </button>

              {/* Branch Login Tab */}
              <button
                type="button"
                onClick={() => handleTabChange('branch')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'branch'
                    ? 'bg-[#004F4C] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-transparent'
                }`}
              >
                <Store className="w-4 h-4 shrink-0" />
                <span>Branch Login</span>
              </button>
            </div>

            {/* Header Titles */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeTab === 'branch' ? 'Branch Login' : 'Head Office Login'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {activeTab === 'branch'
                  ? 'Choose your branch and enter your credentials.'
                  : 'Enter your Super Admin credentials.'}
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

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {activeTab === 'branch' ? (
                /* BRANCH LOGIN VIEW */
                <>
                  {/* Select Branch Custom Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                      Select Branch
                    </label>

                    {/* Dropdown Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                      className={`w-full p-3 sm:p-3.5 bg-white border rounded-xl flex items-center justify-between transition-all cursor-pointer text-left ${
                        isBranchDropdownOpen
                          ? 'border-[#004F4C] ring-2 ring-[#004F4C]/15 shadow-sm'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#e6f7f2] flex items-center justify-center text-[#004F4C] shrink-0">
                          <Store className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-900 text-xs sm:text-sm truncate">
                          {selectedBranch.displayName}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ml-2 ${
                          isBranchDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu Options matching reference image */}
                    {isBranchDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                        {CANONICAL_BRANCHES.map(branch => {
                          const isSelected = selectedBranchId === branch.id;
                          return (
                            <button
                              key={branch.id}
                              type="button"
                              onClick={() => handleSelectBranch(branch.id)}
                              className={`w-full p-2.5 sm:p-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#d7f7eb] text-[#004F4C] font-semibold'
                                  : 'hover:bg-slate-50 text-slate-700 font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Store
                                  className={`w-4 h-4 shrink-0 ${
                                    isSelected ? 'text-[#004F4C]' : 'text-slate-400'
                                  }`}
                                />
                                <span className="text-xs sm:text-sm truncate">
                                  {branch.displayName}
                                </span>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-[#008C83] shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* HEAD OFFICE ADMIN VIEW */
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#ccfbf1] text-[#0f766e] flex items-center justify-center shrink-0">
                    <Crown className="w-6 h-6 text-[#047857]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm">Super Admin</div>
                    <div className="text-xs text-slate-500">
                      Rajesh Sharma · Full access across all 4 branches
                    </div>
                  </div>
                </div>
              )}

              {/* Password / PIN Input Field matching reference image */}
              <div>
                <label
                  htmlFor="login-pin"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2"
                >
                  Password / PIN
                </label>
                <div className="relative flex items-center bg-white border border-slate-300 rounded-xl px-3.5 py-3 focus-within:border-[#004F4C] focus-within:ring-2 focus-within:ring-[#004F4C]/15 transition-all">
                  <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    id="login-pin"
                    ref={pinInputRef}
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="Enter 4–6 digit PIN or password"
                    className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none font-sans"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-slate-400 hover:text-slate-600 transition-colors ml-2 cursor-pointer"
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
                className="w-full mt-6 py-3.5 px-6 rounded-xl bg-[#004F4C] hover:bg-[#003835] active:bg-[#002624] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
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

              {/* Back to Role Selection Link matching screenshot */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleTabChange(activeTab === 'branch' ? 'admin' : 'branch')}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#004F4C] hover:text-[#002826] hover:underline cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Role Selection</span>
                </button>
              </div>
            </form>

            {/* Demo Testing Hint */}
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
