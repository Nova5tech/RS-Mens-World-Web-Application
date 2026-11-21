import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/useAuth';
import { getBranches } from '@/services/branches';
import { Branch } from '@/types/models';
import { HangerIcon } from '@/layouts/Sidebar';

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
          setBranches(data.filter((b) => b.is_active));
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
    formState: { errors: branchErrors, isSubmitting: isBranchSubmitting },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      branchId: 'branch_2',
      pin: '',
    },
  });

  const onTabChange = (tab: 'admin' | 'branch') => {
    setActiveTab(tab);
    setAuthError(null);
    setShowPassword(false);
    setShowPin(false);
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

  return (
    <div className="min-h-screen w-full flex bg-[#F4F7F6]">
      {/* Left Panel: Deep Green Brand Panel with Organic Curves & Visual Depth */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-gradient-to-br from-[#0B3B2E] via-[#0E4737] to-[#072B21] flex-col justify-between p-10 xl:p-14 text-white relative overflow-hidden select-none">
        {/* Soft mint curved organic waves backdrop */}
        <div className="absolute -bottom-24 -right-24 w-[480px] h-[480px] rounded-full bg-accent-brand/10 blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 -right-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />

        {/* Decorative organic curved lines overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 600 800"
          preserveAspectRatio="none"
        >
          <path
            d="M 200,0 C 400,200 100,500 500,800 L 600,800 L 600,0 Z"
            fill="#46D68C"
            fillOpacity="0.15"
          />
          <path
            d="M 350,0 C 500,300 250,600 600,750 L 600,0 Z"
            fill="#46D68C"
            fillOpacity="0.1"
          />
        </svg>

        {/* Top: Brand Logo & Heading */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-accent-brand/10 border border-accent-brand/20 flex items-center justify-center flex-shrink-0 shadow-xs">
            <HangerIcon className="w-7 h-7 text-accent-brand" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
              RS Mens World
            </h1>
            <p className="text-[11px] font-semibold text-accent-brand tracking-wider uppercase mt-0.5">
              MULTI-BRANCH RETAIL & CUSTOMER ENGAGEMENT
            </p>
          </div>
        </div>

        {/* Center: Main Section Title & 4 Feature Cards */}
        <div className="relative z-10 my-auto py-6">
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Branch Sign In
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Access your branch dashboard
          </p>

          {/* 4 Feature Cards with Accent Icon Tiles */}
          <div className="mt-8 space-y-3.5 max-w-md">
            {/* Feature 1 */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.06] border border-white/5 backdrop-blur-xs transition-all hover:bg-white/[0.09]">
              <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600/30 flex items-center justify-center text-accent-brand flex-shrink-0">
                <Store className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Branch-wise Access</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Manage your branch operations
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.06] border border-white/5 backdrop-blur-xs transition-all hover:bg-white/[0.09]">
              <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600/30 flex items-center justify-center text-accent-brand flex-shrink-0">
                <Users className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Leads & Customers</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Track and engage customers
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.06] border border-white/5 backdrop-blur-xs transition-all hover:bg-white/[0.09]">
              <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600/30 flex items-center justify-center text-accent-brand flex-shrink-0">
                <Megaphone className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Campaigns</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Run WhatsApp campaigns
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.06] border border-white/5 backdrop-blur-xs transition-all hover:bg-white/[0.09]">
              <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600/30 flex items-center justify-center text-accent-brand flex-shrink-0">
                <BarChart3 className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Branch Reports</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  View your branch performance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Line */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-accent-brand" strokeWidth={2} />
            <span>Secure Login</span>
          </div>
          <span className="text-slate-500">•</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-accent-brand" strokeWidth={2} />
            <span>Role-based Access</span>
          </div>
          <span className="text-slate-500">•</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-accent-brand" strokeWidth={2} />
            <span>Multi-branch</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Floating Card with 24px radius & generous padding */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile-only Header */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sidebar-bg flex items-center justify-center shadow-md">
              <HangerIcon className="w-6 h-6 text-accent-brand" />
            </div>
            <div>
              <h1 className="text-base font-bold text-app-text leading-tight">
                RS Mens World
              </h1>
              <p className="text-xs text-app-muted">Customer Engagement</p>
            </div>
          </div>

          {/* Login Card (24px radius, generous padding, soft card shadow) */}
          <div className="bg-white rounded-3xl border border-border-card shadow-card p-8 sm:p-10 transition-all">
            {/* Segmented Tab Control with sliding active pill */}
            <div className="grid grid-cols-2 p-1.5 bg-[#F1F5F4] rounded-2xl mb-7 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onTabChange('admin')}
                className={cn(
                  'h-10 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 select-none',
                  activeTab === 'admin'
                    ? 'bg-primary-brand text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-app-text font-medium'
                )}
              >
                <Building2 className="w-4 h-4" strokeWidth={1.75} />
                <span>Head Office (Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => onTabChange('branch')}
                className={cn(
                  'h-10 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 select-none',
                  activeTab === 'branch'
                    ? 'bg-primary-brand text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-app-text font-medium'
                )}
              >
                <Store className="w-4 h-4" strokeWidth={1.75} />
                <span>Branch Login</span>
              </button>
            </div>

            {/* Card Heading */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-app-text tracking-tight">
                {activeTab === 'branch' ? 'Branch Login' : 'Head Office (Admin)'}
              </h2>
              <p className="text-xs sm:text-sm text-app-muted mt-1">
                {activeTab === 'branch'
                  ? 'Choose your branch and enter your credentials.'
                  : 'Enter your credentials to access the executive dashboard.'}
              </p>
            </div>

            {/* Error Message Alert */}
            {authError && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
              >
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                <div className="flex-1 font-medium leading-tight">{authError}</div>
              </div>
            )}

            {/* Tab Form: Head Office (Admin) */}
            {activeTab === 'admin' && (
              <form
                onSubmit={handleSubmitAdmin(onAdminSubmit)}
                className="space-y-4 animate-in fade-in duration-150"
              >
                {/* Email Field: 48px tall */}
                <div>
                  <label
                    htmlFor="admin-email"
                    className="block text-xs font-semibold text-app-text mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                      <Mail className="w-[18px] h-[18px]" strokeWidth={1.75} />
                    </div>
                    <input
                      id="admin-email"
                      type="email"
                      autoComplete="email"
                      placeholder="admin@rsmensworld.com"
                      {...registerAdmin('email')}
                      className={cn(
                        'w-full h-12 pl-10 pr-3 text-sm bg-white border rounded-xl text-app-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-brand focus:border-transparent transition-all',
                        adminErrors.email ? 'border-red-400' : 'border-border-card'
                      )}
                    />
                  </div>
                  {adminErrors.email && (
                    <p className="text-xs font-medium text-red-600 mt-1">
                      {adminErrors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field: 48px tall */}
                <div>
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold text-app-text mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                      <Lock className="w-[18px] h-[18px]" strokeWidth={1.75} />
                    </div>
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      {...registerAdmin('password')}
                      className={cn(
                        'w-full h-12 pl-10 pr-10 text-sm bg-white border rounded-xl text-app-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-brand focus:border-transparent transition-all',
                        adminErrors.password ? 'border-red-400' : 'border-border-card'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-app-muted hover:text-app-text cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.75} />
                      ) : (
                        <Eye className="w-[18px] h-[18px]" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                  {adminErrors.password && (
                    <p className="text-xs font-medium text-red-600 mt-1">
                      {adminErrors.password.message}
                    </p>
                  )}
                </div>

                {/* Demo Helper Box */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-app-muted flex items-center justify-between">
                  <span>Demo: <strong className="text-app-text font-medium">admin@rsmensworld.com</strong></span>
                  <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-app-text text-[11px]">
                    Admin@123
                  </span>
                </div>

                {/* Submit Button: 52px tall */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[52px] mt-2 bg-primary-brand hover:bg-[#0B3B2E] text-white text-sm font-semibold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" strokeWidth={1.75} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Tab Form: Branch Login */}
            {activeTab === 'branch' && (
              <form
                onSubmit={handleSubmitBranch(onBranchSubmit)}
                className="space-y-4 animate-in fade-in duration-150"
              >
                {/* Select Branch Dropdown: 48px tall */}
                <div>
                  <label
                    htmlFor="branch-select"
                    className="block text-xs font-semibold text-app-text mb-1.5"
                  >
                    Select Branch
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                      <Store className="w-[18px] h-[18px]" strokeWidth={1.75} />
                    </div>
                    <select
                      id="branch-select"
                      disabled={branchesLoading}
                      {...registerBranch('branchId')}
                      className={cn(
                        'w-full h-12 pl-10 pr-9 text-sm bg-white border rounded-xl text-app-text focus:outline-none focus:ring-2 focus:ring-accent-brand focus:border-transparent transition-all appearance-none cursor-pointer',
                        branchErrors.branchId ? 'border-red-400' : 'border-border-card'
                      )}
                    >
                      <option value="">
                        {branchesLoading ? 'Loading branches...' : 'Choose your branch...'}
                      </option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    {/* Single custom chevron dropdown arrow */}
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-app-muted">
                      <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                  </div>
                  {branchErrors.branchId && (
                    <p className="text-xs font-medium text-red-600 mt-1">
                      {branchErrors.branchId.message}
                    </p>
                  )}
                </div>

                {/* Password / PIN Field: 48px tall */}
                <div>
                  <label
                    htmlFor="branch-pin"
                    className="block text-xs font-semibold text-app-text mb-1.5"
                  >
                    Password / PIN
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                      <Lock className="w-[18px] h-[18px]" strokeWidth={1.75} />
                    </div>
                    <input
                      id="branch-pin"
                      type={showPin ? 'text' : 'password'}
                      autoComplete="current-password"
                      maxLength={6}
                      placeholder="Enter 4–6 digit PIN or password"
                      {...registerBranch('pin')}
                      className={cn(
                        'w-full h-12 pl-10 pr-10 text-sm bg-white border rounded-xl text-app-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-brand focus:border-transparent transition-all font-mono',
                        branchErrors.pin ? 'border-red-400' : 'border-border-card'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-app-muted hover:text-app-text cursor-pointer"
                    >
                      {showPin ? (
                        <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.75} />
                      ) : (
                        <Eye className="w-[18px] h-[18px]" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                  {branchErrors.pin && (
                    <p className="text-xs font-medium text-red-600 mt-1">
                      {branchErrors.pin.message}
                    </p>
                  )}
                </div>

                {/* Branch PIN Demo Box */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-app-muted">
                  <div className="font-semibold text-app-text mb-1">Demo PIN Reference:</div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-600">
                    <span>B1 Rajahmundry: 1111</span>
                    <span>B2 Kakinada: 2222</span>
                    <span>B3 Vijayawada: 3333</span>
                    <span>B4 Guntur: 4444</span>
                  </div>
                </div>

                {/* Submit Button: 52px tall with LogIn icon */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[52px] mt-2 bg-primary-brand hover:bg-[#0B3B2E] text-white text-sm font-semibold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying & Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" strokeWidth={1.75} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Back to Role Selection / Helper footer */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => onTabChange(activeTab === 'branch' ? 'admin' : 'branch')}
                className="text-xs font-medium text-app-muted hover:text-primary-brand transition-colors cursor-pointer"
              >
                ← {activeTab === 'branch' ? 'Switch to Head Office (Admin)' : 'Switch to Branch Login'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
