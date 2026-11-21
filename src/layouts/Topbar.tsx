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
  X,
  MessageSquare,
  Megaphone,
  Target,
  Users,
  Shield,
  Bot,
  Database,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBranchContext } from '@/contexts/BranchContext';
import { useAuth } from '@/features/auth/useAuth';
import { notificationsService } from '@/services/notifications';
import { NotificationItem } from '@/types/models';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState('This Month');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const branchRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
  }, [selectedBranchId]);

  const loadNotifications = async () => {
    try {
      const items = await notificationsService.getNotifications(selectedBranchId);
      setNotifications(items);
    } catch (e) {
      console.error(e);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (item: NotificationItem) => {
    notificationsService.markAsRead(item.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setIsNotificationOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleMarkAllRead = () => {
    notificationsService.markAllAsRead(notifications.map((n) => n.id));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U';
  const userSubtitle =
    role === 'super_admin' ? 'Head Office' : (selectedBranch?.name || user?.branch_name || 'Branch');

  const selectedBranchLabel =
    selectedBranchId === 'all'
      ? 'All Branches'
      : (selectedBranch?.name || 'All Branches');

  const dateOptions = ['Today', 'This Week', 'This Month', 'Last Month', 'This Quarter'];

  return (
    <>
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
            // Super Admin Selector with custom styled dropdown
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
                      'w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors text-left hover:bg-slate-50 cursor-pointer',
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
                          'w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors text-left hover:bg-slate-50 cursor-pointer',
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

          {/* Date Filter */}
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
                      'w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-slate-50 transition-colors cursor-pointer',
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

          {/* Notifications Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              title="Notifications"
              className={cn(
                'w-10 h-10 rounded-full border border-border-card bg-white flex items-center justify-center text-app-muted hover:text-app-text hover:bg-slate-50 transition-all shadow-card cursor-pointer relative',
                isNotificationOpen && 'border-primary-brand ring-2 ring-accent-brand/20'
              )}
              aria-label="Notifications"
            >
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-border-card shadow-dropdown p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-xs font-semibold text-[#0F4C3A] hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto my-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      No notifications at this time
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={cn(
                          'p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors flex items-start gap-3',
                          !item.read && 'bg-emerald-50/40'
                        )}
                      >
                        <div className="mt-0.5">
                          {item.type === 'lead_followup' && (
                            <Target className="w-4 h-4 text-amber-600" />
                          )}
                          {item.type === 'chat_pending' && (
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                          )}
                          {item.type === 'campaign_done' && (
                            <Megaphone className="w-4 h-4 text-emerald-600" />
                          )}
                          {item.type === 'import_done' && (
                            <Database className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-gray-900 flex items-center justify-between">
                            <span className="truncate">{item.title}</span>
                            {!item.read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 ml-1.5" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            title="Help & User Guide"
            className="hidden sm:flex w-10 h-10 rounded-full border border-border-card bg-white items-center justify-center text-app-muted hover:text-app-text hover:bg-slate-50 transition-all shadow-card cursor-pointer"
            aria-label="Help"
          >
            <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </button>

          {/* User Avatar Circle */}
          <div
            title={`${user?.full_name || 'User'} (${userSubtitle})`}
            className="w-10 h-10 rounded-full bg-primary-brand text-accent-brand flex items-center justify-center text-sm font-bold ring-2 ring-emerald-600/20 select-none shadow-card cursor-pointer"
          >
            {userInitial}
          </div>
        </div>
      </header>

      {/* Help Modal / Slideout */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F4C3A] flex items-center justify-center font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    RS Mens World — Quick Operations Guide
                  </h3>
                  <p className="text-xs text-gray-500">
                    Architecture overview and module workflows for staff and administrators
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WhatsApp Campaigns */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-gray-900">
                  <Megaphone className="w-4 h-4 text-[#0F4C3A]" />
                  <span>WhatsApp Campaigns</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Compose broadcasts with Meta-approved templates. Toggle target branches
                  independently (B1–B4). Customers without consent or opted out are automatically
                  excluded.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsHelpOpen(false);
                    navigate('/campaigns');
                  }}
                  className="text-xs font-bold text-[#0F4C3A] hover:underline flex items-center gap-1 pt-1"
                >
                  Go to Campaigns <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Customer DB & Petpooja */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-gray-900">
                  <Users className="w-4 h-4 text-[#0F4C3A]" />
                  <span>Customer DB & Petpooja Import</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Upload Excel/CSV from Petpooja POS. Auto-maps columns, validates 10-digit Indian
                  mobile numbers, detects duplicates, and assigns to matching branches.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsHelpOpen(false);
                    navigate('/customers');
                  }}
                  className="text-xs font-bold text-[#0F4C3A] hover:underline flex items-center gap-1 pt-1"
                >
                  Go to Customers <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Lead Generation CRM */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-gray-900">
                  <Target className="w-4 h-4 text-[#0F4C3A]" />
                  <span>Lead Pipeline & Kanban</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Track retail inquiries across 5 stages with drag & drop. AI classifies customer intent
                  and priority. Converting a lead creates a validated customer profile.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsHelpOpen(false);
                    navigate('/leads');
                  }}
                  className="text-xs font-bold text-[#0F4C3A] hover:underline flex items-center gap-1 pt-1"
                >
                  Go to Leads <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* AI Chatbot & Widget */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-gray-900">
                  <Bot className="w-4 h-4 text-[#0F4C3A]" />
                  <span>AI Chatbot & Website Widget</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Answers customer inquiries grounded exclusively in approved Knowledge Base
                  articles. Never hallucinates stock or prices, and seamlessly hands over to branch
                  staff.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsHelpOpen(false);
                    navigate('/chatbot');
                  }}
                  className="text-xs font-bold text-[#0F4C3A] hover:underline flex items-center gap-1 pt-1"
                >
                  Go to Chatbot <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Architecture Callout */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5 text-xs text-emerald-950">
              <div className="font-bold flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-700" />
                Multi-Branch Scoping & Role Isolation
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Super Admins access all 4 branches with global analytics. Branch staff are strictly
                restricted to their designated branch data across customers, leads, campaigns, and
                chat inbox.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
