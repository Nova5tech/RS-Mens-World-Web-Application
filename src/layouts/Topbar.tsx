import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Store,
  Calendar,
  Bell,
  HelpCircle,
  ChevronDown,
  Lock,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBranchContext } from '@/contexts/BranchContext';
import { useAuth } from '@/features/auth/useAuth';

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
  const { branches, selectedBranchId, setSelectedBranchId, selectedBranch, isLocked } =
    useBranchContext();
  const { user, role } = useAuth();

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState('This Month');

  const branchRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U';
  const userSubtitle =
    role === 'super_admin' ? 'Head Office' : (selectedBranch?.name || user?.branch_name || 'Branch');

  const selectedBranchLabel =
    selectedBranchId === 'all'
      ? 'All Branches'
      : (selectedBranch?.name || 'All Branches');

  const dateOptions = ['Today', 'This Week', 'This Month', 'Last Month', 'This Quarter'];

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-border-card px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 -ml-1 text-app-muted hover:text-app-text hover:bg-slate-100 rounded-lg cursor-pointer"
        >
          <Menu className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-app-text leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-app-muted leading-tight mt-0.5 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Branch Selector */}
        {isLocked ? (
          // Locked view for Branch Users (No dropdown, strictly locked to their branch)
          <div
            title={`Logged into ${userSubtitle} (Branch restricted)`}
            className="flex items-center gap-2 h-10 px-3 bg-slate-50 border border-border-card rounded-xl text-xs font-medium text-app-text shadow-card select-none cursor-default"
          >
            <Store className="w-[18px] h-[18px] text-primary-brand flex-shrink-0" strokeWidth={1.75} />
            <span className="font-semibold text-app-text max-w-[120px] sm:max-w-[190px] truncate">
              {selectedBranch ? selectedBranch.name : (user?.branch_name || 'My Branch')}
            </span>
            <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={1.75} />
          </div>
        ) : (
          // Super Admin Selector with custom styled dropdown (Single chevron, checkmark)
          <div className="relative" ref={branchRef}>
            <button
              type="button"
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className={cn(
                'flex items-center gap-2 h-10 px-3.5 bg-white border rounded-xl text-xs font-medium text-app-text hover:bg-slate-50 shadow-card transition-all cursor-pointer',
                isBranchDropdownOpen ? 'border-primary-brand ring-2 ring-accent-brand/20' : 'border-border-card'
              )}
            >
              <Store className="w-[18px] h-[18px] text-primary-brand flex-shrink-0" strokeWidth={1.75} />
              <span className="font-medium text-app-text max-w-[110px] sm:max-w-[180px] truncate">
                {selectedBranchLabel}
              </span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-app-muted flex-shrink-0 transition-transform duration-150',
                  isBranchDropdownOpen && 'rotate-180'
                )}
                strokeWidth={1.75}
              />
            </button>

            {/* Custom Dropdown Menu with Shadow & Check Marks */}
            {isBranchDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl border border-border-card shadow-dropdown py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-app-muted border-b border-border-card/60">
                  Select Store Branch
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBranchId('all');
                    setIsBranchDropdownOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors text-left hover:bg-slate-50',
                    selectedBranchId === 'all'
                      ? 'bg-accent-soft/70 text-primary-brand font-semibold'
                      : 'text-app-text'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Store className="w-4 h-4 text-primary-brand flex-shrink-0" strokeWidth={1.75} />
                    <span className="truncate">All Branches</span>
                  </div>
                  {selectedBranchId === 'all' && (
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={2} />
                  )}
                </button>

                {branches.map((b) => {
                  const isSelected = selectedBranchId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedBranchId(b.id);
                        setIsBranchDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors text-left hover:bg-slate-50',
                        isSelected
                          ? 'bg-accent-soft/70 text-primary-brand font-semibold'
                          : 'text-app-text'
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Store className="w-4 h-4 text-primary-brand flex-shrink-0" strokeWidth={1.75} />
                        <span className="truncate">{b.name}</span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={2} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Date Filter: 40px tall, rounded-xl */}
        <div className="relative hidden md:block" ref={dateRef}>
          <button
            type="button"
            onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
            className={cn(
              'flex items-center gap-2 h-10 px-3.5 bg-white border rounded-xl text-xs font-medium text-app-text hover:bg-slate-50 shadow-card transition-all cursor-pointer',
              isDateDropdownOpen ? 'border-primary-brand ring-2 ring-accent-brand/20' : 'border-border-card'
            )}
          >
            <Calendar className="w-[18px] h-[18px] text-app-muted flex-shrink-0" strokeWidth={1.75} />
            <span>{selectedDateFilter}</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-app-muted flex-shrink-0 transition-transform duration-150',
                isDateDropdownOpen && 'rotate-180'
              )}
              strokeWidth={1.75}
            />
          </button>

          {isDateDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl border border-border-card shadow-dropdown py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {dateOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedDateFilter(opt);
                    setIsDateDropdownOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-slate-50 transition-colors',
                    selectedDateFilter === opt
                      ? 'bg-accent-soft/70 text-primary-brand font-semibold'
                      : 'text-app-text'
                  )}
                >
                  <span>{opt}</span>
                  {selectedDateFilter === opt && (
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={2} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell Button: 40px round icon button */}
        <button
          type="button"
          title="Notifications"
          className="w-10 h-10 rounded-full border border-border-card bg-white flex items-center justify-center text-app-muted hover:text-app-text hover:bg-slate-50 transition-all shadow-card cursor-pointer relative"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Help Button: 40px round icon button */}
        <button
          type="button"
          title="Help & Documentation"
          className="hidden sm:flex w-10 h-10 rounded-full border border-border-card bg-white items-center justify-center text-app-muted hover:text-app-text hover:bg-slate-50 transition-all shadow-card cursor-pointer"
          aria-label="Help"
        >
          <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </button>

        {/* User Avatar Circle: 40px round circle */}
        <div
          title={`${user?.full_name || 'User'} (${userSubtitle})`}
          className="w-10 h-10 rounded-full bg-primary-brand text-accent-brand flex items-center justify-center text-sm font-bold ring-2 ring-emerald-600/20 select-none shadow-card cursor-pointer"
        >
          {userInitial}
        </div>
      </div>
    </header>
  );
};
