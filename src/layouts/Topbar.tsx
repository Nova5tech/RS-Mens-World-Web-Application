import React from 'react';
import {
  Menu,
  Store,
  Calendar,
  Bell,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { useBranchContext } from '@/contexts/BranchContext';

export interface TopbarProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
}) => {
  const { branches, selectedBranchId, setSelectedBranchId } = useBranchContext();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-border-card px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-1.5 -ml-1 text-app-muted hover:text-app-text hover:bg-slate-100 rounded-lg cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-app-text leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-app-muted leading-tight mt-0.5 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls: Branch selector, Date filter, Bell, Help, Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Branch Selector (Fetches 4 branches from service) */}
        <div className="relative inline-flex items-center">
          <div className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 bg-white border border-border-card rounded-lg text-xs font-medium text-app-text hover:bg-slate-50 transition-colors shadow-2xs">
            <Store className="w-3.5 h-3.5 text-primary-brand flex-shrink-0" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              aria-label="Filter by branch"
              className="bg-transparent font-medium text-app-text outline-none cursor-pointer max-w-[120px] sm:max-w-[190px] truncate"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-app-muted pointer-events-none -ml-1" />
          </div>
        </div>

        {/* Date Filter */}
        <div className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 bg-white border border-border-card rounded-lg text-xs font-medium text-app-text hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer">
          <Calendar className="w-3.5 h-3.5 text-app-muted flex-shrink-0" />
          <span>This Month</span>
          <ChevronDown className="w-3 h-3 text-app-muted" />
        </div>

        {/* Notifications Bell with dot */}
        <button
          type="button"
          title="Notifications"
          className="relative p-2 text-app-muted hover:text-app-text hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Help Button */}
        <button
          type="button"
          title="Help & Documentation"
          className="hidden sm:inline-flex p-2 text-app-muted hover:text-app-text hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Avatar Circle */}
        <div
          title="Super Admin (Head Office)"
          className="w-8 h-8 rounded-full bg-sidebar-bg text-accent-brand flex items-center justify-center text-xs font-bold ring-2 ring-emerald-600/30 select-none cursor-pointer"
        >
          S
        </div>
      </div>
    </header>
  );
};
