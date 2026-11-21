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
  ShieldCheck,
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

  const [activeTab, setActiveTab] = useState<'admin' | 'branch'>('admin');
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
      branchId: '',
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
    <div className="min-h-screen w-full flex bg-page-bg">
      {/* Left Panel: Dark Green Brand Panel (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-sidebar-bg flex-col justify-between p-10 xl:p-14 text-white relative overflow-hidden select-none">
        {/* Subtle background glow/decoration */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-brand/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo & Name */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#082C22] flex items-center justify-center shadow-inner border border-emerald-700/50">
            <HangerIcon className="w-6 h-6 text-accent-brand" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
              RS Mens World
            </h1>
            <p className="text-xs font-medium text-emerald-400">
              Customer Engagement Platform
            </p>
          </div>
        </div>

        {/* Center Main Content & Feature Rows */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-[11px] font-bold text-accent-brand tracking-wider uppercase mb-4">
            MULTI-BRANCH RETAIL & CUSTOMER ENGAGEMENT
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-snug">
            Branch Sign In
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-md leading-relaxed">
            Manage your store operations, customer engagement, and real-time performance across branches.
          </p>

          {/* 4 Feature Rows */}
          <div className="mt-8 space-y-4">
            {/* Feature 1 */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-lg bg-emerald-900/70 border border-emerald-700/50 flex items-center justify-center text-accent-brand flex-shrink-0 mt-0.5">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Branch-wise Access</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Isolated store data, role-based controls, and branch-specific workflows.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-lg bg-emerald-900/70 border border-emerald-700/50 flex items-center justify-center text-accent-brand flex-shrink-0 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Leads & Customers</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Unified CRM with Petpooja POS sync and instant lead management.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-lg bg-emerald-900/70 border border-emerald-700/50 flex items-center justify-center text-accent-brand flex-shrink-0 mt-0.5">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Campaigns</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Automated WhatsApp outreach with branch toggle delivery controls.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-lg bg-emerald-900/70 border border-emerald-700/50 flex items-center justify-center text-accent-brand flex-shrink-0 mt-0.5">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Branch Reports</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Store performance analytics, customer visits, and conversion audits.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer line */}
        <div className="relative z-10 pt-4 border-t border-emerald-900/60 flex items-center justify-between text-xs text-emerald-400/80">
          <span>RS Mens World • Retail Engagement Platform</span>
          <span>v1.0.0</span>
        </div>
      </div>

      {/* Right Panel: Sign In Card Container */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile-only Header Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sidebar-bg flex items-center justify-center shadow-md">
              <HangerIcon className="w-5 h-5 text-accent-brand" />
            </div>
            <div>
              <h1 className="text-base font-bold text-app-text leading-tight">
                RS Mens World
              </h1>
              <p className="text-xs text-app-muted">Customer Engagement</p>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-card border border-border-card shadow-lg p-6 sm:p-8">
            {/* Card Titles */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-app-text tracking-tight">
                Sign In
              </h2>
              <p className="text-xs sm:text-sm text-app-muted mt-1">
                Choose your portal to access your store or admin dashboard
              </p>
            </div>

            {/* Two Tabs: Head Office (Admin) & Branch Login */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onTabChange('admin')}
                className={cn(
                  'py-2 px-3 rounded-lg text-center transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5',
                  activeTab === 'admin'
                    ? 'bg-white text-app-text shadow-xs font-bold'
                    : 'text-app-muted hover:text-app-text'
                )}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Head Office (Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => onTabChange('branch')}
                className={cn(
                  'py-2 px-3 rounded-lg text-center transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5',
                  activeTab === 'branch'
                    ? 'bg-white text-app-text shadow-xs font-bold'
                    : 'text-app-muted hover:text-app-text'
                )}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Branch Login</span>
              </button>
            </div>

            {/* Error Message Alert */}
            {authError && (
              <div
                role="alert"
                className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
              >
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-tight">{authError}</div>
              </div>
            )}

            {/* Form: Head Office (Admin) */}
            {activeTab === 'admin' && (
              <form onSubmit={handleSubmitAdmin(onAdminSubmit)} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="admin-email"
                    className="block text-xs font-semibold text-app-text mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-app-muted">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-email"
                      type="email"
                      autoComplete="email"
                      placeholder="admin@rsmensworld.com"
                      {...registerAdmin('email')}
                      className={cn(
                        'w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border rounded-xl text-app-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-brand/30 transition-all',
                        adminErrors.email ? 'border-red-400' : 'border-border-card'
                      )}
                    />
                  </div>
                  {adminErrors.email && (
                    <p className="text-[11px] font-medium text-red-600 mt-1">
                      {adminErrors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold text-app-text mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-app-muted">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      {...registerAdmin('password')}
                      className={cn(
                        'w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-white border rounded-xl text-app-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-brand/30 transition-all',
                        adminErrors.password ? 'border-red-400' : 'border-border-card'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-app-muted hover:text-app-text cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {adminErrors.password && (
                    <p className="text-[11px] font-medium text-red-600 mt-1">
                      {adminErrors.password.message}
                    </p>
                  )}
                </div>

                {/* Demo Helper Box */}
                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-800 flex items-center justify-between">
                  <span className="font-medium">Demo: admin@rsmensworld.com</span>
                  <span className="font-mono bg-emerald-100/70 px-1.5 py-0.5 rounded text-emerald-900">
                    Admin@123
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-2.5 px-4 bg-primary-brand hover:bg-[#0c3e2f] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Sign In to Head Office</span>
                  )}
                </button>
              </form>
            )}

            {/* Form: Branch Login */}
            {activeTab === 'branch' && (
              <form onSubmit={handleSubmitBranch(onBranchSubmit)} className="space-y-4">
                {/* Branch Selection Dropdown */}
                <div>
                  <label
                    htmlFor="branch-select"
                    className="block text-xs font-semibold text-app-text mb-1.5"
                  >
                    Select Branch
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-app-muted">
                      <Store className="w-4 h-4" />
                    </div>
                    <select
                      id="branch-select"
                      disabled={branchesLoading}
                      {...registerBranch('branchId')}
                      className={cn(
                        'w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border rounded-xl text-app-text focus:outline-none focus:ring-2 focus:ring-primary-brand/30 transition-all appearance-none cursor-pointer',
                        branchErrors.branchId ? 'border-red-400' : 'border-border-card'
                      )}
                    >
                      <option value="">
                        {branchesLoading ? 'Loading branches...' : 'Choose your branch...'}
                      </option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.code} – {b.name} ({b.city})
                        </option>
                      ))}
                    </select>
                    {/* Single custom chevron dropdown arrow */}
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-app-muted">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {branchErrors.branchId && (
                    <p className="text-[11px] font-medium text-red-600 mt-1">
                      {branchErrors.branchId.message}
                    </p>
                  )}
                </div>

                {/* Password / PIN Field */}
                <div>
                  <label
                    htmlFor="branch-pin"
                    className="block text-xs font-semibold text-app-text mb-1.5"
                  >
                    Password / PIN (4–6 digits)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-app-muted">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="branch-pin"
                      type={showPin ? 'text' : 'password'}
                      autoComplete="current-password"
                      maxLength={6}
                      placeholder="Enter branch PIN (e.g. 2222)"
                      {...registerBranch('pin')}
                      className={cn(
                        'w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-white border rounded-xl text-app-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-brand/30 transition-all font-mono',
                        branchErrors.pin ? 'border-red-400' : 'border-border-card'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-app-muted hover:text-app-text cursor-pointer"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {branchErrors.pin && (
                    <p className="text-[11px] font-medium text-red-600 mt-1">
                      {branchErrors.pin.message}
                    </p>
                  )}
                </div>

                {/* Branch PIN Demo Reference */}
                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-800">
                  <div className="font-semibold text-emerald-900 mb-1">Branch Demo PINs:</div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                    <span>B1 Rajahmundry: 1111</span>
                    <span>B2 Kakinada: 2222</span>
                    <span>B3 Vijayawada: 3333</span>
                    <span>B4 Guntur: 4444</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-2.5 px-4 bg-primary-brand hover:bg-[#0c3e2f] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying & Signing In...</span>
                    </>
                  ) : (
                    <span>Sign In to Branch</span>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Security Note */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-app-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-branch tenant isolated security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
