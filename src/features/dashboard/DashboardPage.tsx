import React from 'react';
import {
  Users,
  Megaphone,
  Target,
  Bot,
  Store,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useBranchContext } from '@/contexts/BranchContext';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, role } = useAuth();
  const { sidebarChipText } = useBranchContext();

  const userRoleLabel =
    role === 'super_admin' ? 'Super Admin (Head Office)' : `${sidebarChipText} Store Manager`;

  const kpis = [
    {
      title: 'Total Customers',
      icon: Users,
      value: '—',
      caption: 'Petpooja POS & CRM database',
      link: '/customers',
    },
    {
      title: 'Active Campaigns',
      icon: Megaphone,
      value: '—',
      caption: 'WhatsApp marketing broadcasts',
      link: '/campaigns',
    },
    {
      title: 'New Leads',
      icon: Target,
      value: '—',
      caption: 'Inbound enquiry pipeline',
      link: '/leads',
    },
    {
      title: 'Open Chats',
      icon: Bot,
      value: '—',
      caption: 'AI assistant conversations',
      link: '/chatbot',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="bg-white rounded-xl border border-border-card p-5 shadow-card hover:shadow-dropdown transition-all duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-app-muted">
                  {kpi.title}
                </span>
                <div className="w-10 h-10 rounded-xl bg-accent-soft text-primary-brand flex items-center justify-center flex-shrink-0">
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-bold text-app-text tracking-tight">
                  {kpi.value}
                </span>
                <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Phase 8
                </span>
              </div>
              <p className="mt-2 text-xs text-app-muted truncate">
                {kpi.caption}
              </p>
            </div>
          );
        })}
      </div>

      {/* Welcome & Overview Card Below */}
      <div className="bg-white rounded-2xl border border-border-card p-6 sm:p-8 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border-card/70">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-primary-brand text-xs font-semibold mb-2">
              <Store className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{userRoleLabel}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-app-text tracking-tight">
              Welcome back, {user?.full_name || 'Store User'}
            </h2>
            <p className="text-xs sm:text-sm text-app-muted mt-1 max-w-2xl leading-relaxed">
              RS Mens World Customer Engagement Platform connects retail operations, customer data, and WhatsApp engagement across Rajahmundry, Kakinada, Vijayawada, and Guntur.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              to="/customers"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-primary-brand text-white rounded-xl text-xs font-semibold hover:bg-[#0B3B2E] shadow-sm transition-all cursor-pointer active:scale-[0.98]"
            >
              <span>View Customers</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </Link>
            <Link
              to="/leads"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-white text-app-text border border-border-card rounded-xl text-xs font-semibold hover:bg-slate-50 shadow-card transition-all cursor-pointer active:scale-[0.98]"
            >
              <span>Track Leads</span>
            </Link>
          </div>
        </div>

        {/* Feature status badges & platform summary */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
            <div>
              <h4 className="text-xs font-semibold text-app-text">Multi-Branch Tenancy</h4>
              <p className="text-[11px] text-app-muted mt-0.5">
                Role-based branch scoping is active and enforced.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary-brand flex-shrink-0 mt-0.5" strokeWidth={1.75} />
            <div>
              <h4 className="text-xs font-semibold text-app-text">Authentication Active</h4>
              <p className="text-[11px] text-app-muted mt-0.5">
                Session verified with token storage and route guards.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Store className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
            <div>
              <h4 className="text-xs font-semibold text-app-text">Connected Branches</h4>
              <p className="text-[11px] text-app-muted mt-0.5">
                4 retail stores initialized (B1, B2, B3, B4).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
