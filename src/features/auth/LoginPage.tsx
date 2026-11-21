import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Store,
  Users,
  Megaphone,
  BarChart3,
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  LogIn,
  Check,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/useAuth';
import { getBranches } from '@/services/branches';
import { Branch } from '@/types/models';

// Zod schemas for validation
const adminSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

const branchSchema = z.object({
  branchId: z.string().min(1, 'Please select a branch'),
  pin: z
    .string()
    .min(1, 'Password / PIN is required')
    .regex(/^\d{4,6}$/, 'PIN must be 4 to 6 digits'),
});

type AdminFormValues = z.infer<typeof adminSchema>;
type BranchFormValues = z.infer<typeof branchSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'admin' | 'branch'>('branch');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPin, setShowPin] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // If user is already authenticated, redirect to /dashboard
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, location.state]);

  // Fetch branches for branch dropdown
  useEffect(() => {
    let mounted = true;
    getBranches()
      .then((data) => {
        if (mounted) {
          const active = data.filter((b) => b.is_active);
          setBranches(active);
          setBranchesLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load branches', err);
        if (mounted) setBranchesLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form for Head Office (Admin)
  const {
    register: registerAdmin,
    handleSubmit: handleSubmitAdmin,
    formState: { errors: adminErrors, isSubmitting: isAdminSubmitting },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Form for Branch Login
  const {
    register: registerBranch,
    handleSubmit: handleSubmitBranch,
    setValue: setBranchValue,
    watch: watchBranch,
    formState: { errors: branchErrors, isSubmitting: isBranchSubmitting },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      branchId: 'branch_1',
      pin: '',
    },
  });

  const selectedBranchId = watchBranch('branchId');
  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  const onTabChange = (tab: 'admin' | 'branch') => {
    setActiveTab(tab);
    setAuthError(null);
    setShowPassword(false);
    setShowPin(false);
    setIsDropdownOpen(false);
  };

  const onAdminSubmit = async (data: AdminFormValues) => {
    setAuthError(null);
    try {
      await login({
        type: 'admin',
        email: data.email,
        password: data.password,
      });
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setAuthError(message);
    }
  };

  const onBranchSubmit = async (data: BranchFormValues) => {
    setAuthError(null);
    try {
      await login({
        type: 'branch',
        branchId: data.branchId,
        pin: data.pin,
      });
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid branch credentials. Please try again.';
      setAuthError(message);
    }
  };

  const isSubmitting = isAdminSubmitting || isBranchSubmitting;
  const showDemoLogins = import.meta.env.VITE_SHOW_DEMO_LOGINS === 'true';

  // Helper format branch label: "Branch 1 – Rajahmandary Main Branch"
  const getBranchLabel = (b: Branch) => {
    const num = b.code.replace(/\D/g, '') || '1';
    return `Branch ${num} – ${b.name}`;
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0B3B2E] lg:bg-transparent relative overflow-hidden select-none">
      {/* Background Layer with Store Photo and Wave Gradients */}
      <div className="absolute inset-0 z-0 hidden lg:flex pointer-events-none">
        {/* Left deep green solid-to-transparent backdrop */}
        <div className="w-[55%] h-full bg-[#073528] relative">
          {/* Store Photo on right side of left panel with left-to-right fade mask */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity"
            style={{
              backgroundImage: 'url(/images/login-store.jpg)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.85) 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.85) 100%)',
            }}
          />
          {/* Dark green gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#073528] via-[#073528]/80 to-transparent" />
        </div>

        {/* Right backdrop: mint transition and page background */}
        <div className="w-[45%] h-full bg-[#EBF7F2] relative overflow-hidden">
          {/* Soft radial glow */}
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-accent-brand/15 blur-3xl" />
        </div>

        {/* Large mint organic curved waves sweeping from bottom-center up into the right */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1671 941"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="mintWaveGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#25A56F" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#46D68C" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8EF0C6" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="mintWaveGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#46D68C" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#A7F3D0" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#D1FAE5" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Deeper mint wave path */}
          <path
            d="M 680,941 C 740,780 780,620 950,420 C 1080,260 1200,140 1450,40 L 1671,0 L 1671,941 Z"
            fill="url(#mintWaveGrad1)"
          />

          {/* Lighter mint foreground sweeping wave */}
          <path
            d="M 740,941 C 820,800 890,660 1080,480 C 1220,340 1380,200 1671,110 L 1671,941 Z"
            fill="url(#mintWaveGrad2)"
          />
        </svg>
      </div>

      {/* Left Panel: Content (approx 55% width) */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 xl:p-16 text-white relative z-10 select-none">
        {/* Top: Logo row */}
        <div>
          <div className="flex items-center gap-4">
            <img
              src="/images/logo-hanger.svg"
              alt="RS Mens World Logo"
              className="h-14 w-auto object-contain flex-shrink-0"
            />
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-none">
              RS Mens World
            </h1>
          </div>
          <p className="text-sm font-semibold text-white/95 uppercase tracking-[0.25em] mt-3.5">
            MULTI-BRANCH RETAIL &amp; CUSTOMER ENGAGEMENT
          </p>
        </div>

        {/* Center: Headings & 4 Feature Rows */}
        <div className="my-auto py-8">
          <h2 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight">
            {activeTab === 'branch' ? 'Branch Sign In' : 'Head Office Sign In'}
          </h2>
          <p className="text-xl xl:text-2xl text-white/90 mt-2 font-normal">
            {activeTab === 'branch' ? 'Access your branch dashboard' : 'Access the admin console'}
          </p>

          {/* 4 Feature Rows: NO card backgrounds, 56px rounded-xl solid teal tile */}
          <div className="mt-10 space-y-6 max-w-lg">
            {/* Row 1 */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0F765A] flex items-center justify-center text-white flex-shrink-0 shadow-md">
                <Store className="w-7 h-7" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-snug">Branch-wise Access</h3>
                <p className="text-sm text-white/85 leading-snug mt-0.5">
                  Manage your branch operations
                </p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0F765A] flex items-center justify-center text-white flex-shrink-0 shadow-md">
                <Users className="w-7 h-7" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-snug">Leads &amp; Customers</h3>
                <p className="text-sm text-white/85 leading-snug mt-0.5">
                  Track and engage customers
                </p>
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0F765A] flex items-center justify-center text-white flex-shrink-0 shadow-md">
                <Megaphone className="w-7 h-7" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-snug">Campaigns</h3>
                <p className="text-sm text-white/85 leading-snug mt-0.5">
                  Run WhatsApp campaigns
                </p>
              </div>
            </div>

            {/* Row 4 */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0F765A] flex items-center justify-center text-white flex-shrink-0 shadow-md">
                <BarChart3 className="w-7 h-7" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-snug">Branch Reports</h3>
                <p className="text-sm text-white/85 leading-snug mt-0.5">
                  View your branch performance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Line */}
        <div className="flex items-center gap-2.5 text-sm text-white/85">
          <ShieldCheck className="w-5 h-5 text-accent-brand flex-shrink-0" strokeWidth={2.2} />
          <span>Secure Login</span>
          <span className="text-accent-brand">•</span>
          <span>Role-based Access</span>
          <span className="text-accent-brand">•</span>
          <span>Multi-branch</span>
        </div>
      </div>

      {/* Right Panel: Floating Card */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative z-20 overflow-y-auto">
        <div className="w-full max-w-[560px]">
          {/* Mobile-only Header */}
          <div className="lg:hidden flex flex-col items-center justify-center text-center gap-2 mb-8">
            <img
              src="/images/logo-hanger.svg"
              alt="RS Mens World"
              className="h-12 w-auto object-contain"
            />
            <h1 className="text-2xl font-extrabold text-white">RS Mens World</h1>
            <p className="text-xs font-semibold text-accent-brand uppercase tracking-wider">
              MULTI-BRANCH RETAIL &amp; CUSTOMER ENGAGEMENT
            </p>
          </div>

          {/* White Card: radius 28px, 40px padding, large soft shadow */}
          <div className="bg-white rounded-[28px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 p-8 sm:p-10 transition-all">
            {/* Segmented Control at Top */}
            <div className="grid grid-cols-2 p-1.5 bg-[#F1F4F3] rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => onTabChange('admin')}
                className={cn(
                  'h-12 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 select-none text-sm font-semibold',
                  activeTab === 'admin'
                    ? 'bg-[#0F4C3A] text-white shadow-md'
                    : 'text-slate-800 hover:text-black font-semibold'
                )}
              >
                <Building2 className="w-5 h-5" strokeWidth={2} />
                <span>Head Office (Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => onTabChange('branch')}
                className={cn(
                  'h-12 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 select-none text-sm font-semibold',
                  activeTab === 'branch'
                    ? 'bg-[#0F4C3A] text-white shadow-md'
                    : 'text-slate-800 hover:text-black font-semibold'
                )}
              >
                <Store className="w-5 h-5" strokeWidth={2} />
                <span>Branch Login</span>
              </button>
            </div>

            {/* Card Heading */}
            <div className="mb-7">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeTab === 'branch' ? 'Branch Login' : 'Head Office Login'}
              </h2>
              <p className="text-base text-slate-500 mt-1.5">
                {activeTab === 'branch'
                  ? 'Choose your branch and enter your credentials.'
                  : 'Sign in with your admin email and password.'}
              </p>
            </div>

            {/* Auth Error Alert */}
            {authError && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-in fade-in duration-150"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                <div className="flex-1 font-medium leading-tight">{authError}</div>
              </div>
            )}

            {/* Branch Login Form */}
            {activeTab === 'branch' && (
              <form
                onSubmit={handleSubmitBranch(onBranchSubmit)}
                className="space-y-6 animate-in fade-in duration-150"
              >
                {/* Select Branch Custom Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <label
                    id="branch-label"
                    className="block text-sm font-semibold text-slate-900 mb-2"
                  >
                    Select Branch
                  </label>
                  <input type="hidden" {...registerBranch('branchId')} />

                  {/* Dropdown Trigger: 56px, radius 14px, dark green border when open */}
                  <button
                    type="button"
                    aria-labelledby="branch-label"
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={cn(
                      'w-full h-14 px-4 rounded-[14px] bg-white border flex items-center justify-between text-left transition-all cursor-pointer',
                      isDropdownOpen
                        ? 'border-[#0F4C3A] border-[1.5px] ring-2 ring-[#0F4C3A]/10'
                        : branchErrors.branchId
                        ? 'border-red-400'
                        : 'border-slate-300 hover:border-slate-400'
                    )}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Store className="w-5 h-5 text-[#0F4C3A] flex-shrink-0" strokeWidth={2} />
                      <span className="font-bold text-slate-900 text-base truncate">
                        {branchesLoading
                          ? 'Loading branches...'
                          : selectedBranch
                          ? getBranchLabel(selectedBranch)
                          : 'Choose your branch...'}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-slate-700 transition-transform duration-200 flex-shrink-0',
                        isDropdownOpen && 'rotate-180'
                      )}
                      strokeWidth={2}
                    />
                  </button>

                  {/* Custom Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      role="listbox"
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[14px] shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    >
                      {branches.map((b) => {
                        const isSelected = b.id === selectedBranchId;
                        return (
                          <div
                            key={b.id}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setBranchValue('branchId', b.id, { shouldValidate: true });
                              setIsDropdownOpen(false);
                            }}
                            className={cn(
                              'flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer text-sm font-semibold transition-colors',
                              isSelected
                                ? 'bg-[#CFF5E3] text-slate-900'
                                : 'text-slate-800 hover:bg-slate-50'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Store className="w-5 h-5 text-[#0F4C3A]" strokeWidth={2} />
                              <span className="font-bold">{getBranchLabel(b)}</span>
                            </div>
                            {isSelected && (
                              <Check className="w-5 h-5 text-[#0F4C3A]" strokeWidth={2.5} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {branchErrors.branchId && (
                    <p className="text-xs font-medium text-red-600 mt-1.5">
                      {branchErrors.branchId.message}
                    </p>
                  )}
                </div>

                {/* Password / PIN: 56px tall */}
                <div>
                  <label
                    htmlFor="branch-pin"
                    className="block text-sm font-semibold text-slate-900 mb-2"
                  >
                    Password / PIN
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-700">
                      <Lock className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <input
                      id="branch-pin"
                      type={showPin ? 'text' : 'password'}
                      autoComplete="current-password"
                      maxLength={6}
                      placeholder="Enter 4–6 digit PIN or password"
                      {...registerBranch('pin')}
                      className={cn(
                        'w-full h-14 pl-12 pr-12 text-base bg-white border rounded-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F4C3A] focus:border-[1.5px] focus:ring-2 focus:ring-[#0F4C3A]/10 transition-all font-mono',
                        branchErrors.pin ? 'border-red-400' : 'border-slate-300'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      {showPin ? (
                        <EyeOff className="w-5 h-5" strokeWidth={1.75} />
                      ) : (
                        <Eye className="w-5 h-5" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                  {branchErrors.pin && (
                    <p className="text-xs font-medium text-red-600 mt-1.5">
                      {branchErrors.pin.message}
                    </p>
                  )}
                </div>

                {/* Sign In Button: 60px tall, radius 14px, primary dark green */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[60px] bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white text-lg font-semibold rounded-[14px] shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" strokeWidth={2} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Admin (Head Office) Form */}
            {activeTab === 'admin' && (
              <form
                onSubmit={handleSubmitAdmin(onAdminSubmit)}
                className="space-y-6 animate-in fade-in duration-150"
              >
                {/* Email Field: 56px tall */}
                <div>
                  <label
                    htmlFor="admin-email"
                    className="block text-sm font-semibold text-slate-900 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-700">
                      <Mail className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <input
                      id="admin-email"
                      type="email"
                      autoComplete="email"
                      placeholder="admin@rsmensworld.com"
                      {...registerAdmin('email')}
                      className={cn(
                        'w-full h-14 pl-12 pr-4 text-base bg-white border rounded-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F4C3A] focus:border-[1.5px] focus:ring-2 focus:ring-[#0F4C3A]/10 transition-all',
                        adminErrors.email ? 'border-red-400' : 'border-slate-300'
                      )}
                    />
                  </div>
                  {adminErrors.email && (
                    <p className="text-xs font-medium text-red-600 mt-1.5">
                      {adminErrors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field: 56px tall */}
                <div>
                  <label
                    htmlFor="admin-password"
                    className="block text-sm font-semibold text-slate-900 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-700">
                      <Lock className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter admin password"
                      {...registerAdmin('password')}
                      className={cn(
                        'w-full h-14 pl-12 pr-12 text-base bg-white border rounded-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F4C3A] focus:border-[1.5px] focus:ring-2 focus:ring-[#0F4C3A]/10 transition-all',
                        adminErrors.password ? 'border-red-400' : 'border-slate-300'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" strokeWidth={1.75} />
                      ) : (
                        <Eye className="w-5 h-5" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                  {adminErrors.password && (
                    <p className="text-xs font-medium text-red-600 mt-1.5">
                      {adminErrors.password.message}
                    </p>
                  )}
                </div>

                {/* Sign In Button: 60px tall */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[60px] bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white text-lg font-semibold rounded-[14px] shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" strokeWidth={2} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Back to Role Selection / Switch link */}
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => onTabChange(activeTab === 'branch' ? 'admin' : 'branch')}
                className="text-sm font-semibold text-[#0F4C3A] hover:underline transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>←</span>
                <span>{activeTab === 'branch' ? 'Back to Role Selection' : 'Switch to Branch Login'}</span>
              </button>
            </div>
          </div>

          {/* Demo Credentials only when VITE_SHOW_DEMO_LOGINS === 'true' */}
          {showDemoLogins && (
            <div className="mt-4 text-center text-xs text-slate-500 bg-white/80 backdrop-blur-xs py-2 px-4 rounded-xl border border-slate-200/50 max-w-sm mx-auto">
              {activeTab === 'admin' ? (
                <span>Demo Admin: <strong>admin@rsmensworld.com</strong> / <strong>Admin@123</strong></span>
              ) : (
                <span>Demo PINs: B1: <strong>1111</strong>, B2: <strong>2222</strong>, B3: <strong>3333</strong>, B4: <strong>4444</strong></span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
