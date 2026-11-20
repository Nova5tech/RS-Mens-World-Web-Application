import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Store,
  Calendar,
  Bell,
  HelpCircle,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Shield,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBranch } from '../../context/BranchContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function TopBar({ onOpenMobileMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin, isBranchUser, logout } = useAuth();
  const { branches, activeBranchId, setActiveBranchId } = useBranch();
  const { showToast } = useToast();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const profileMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Close menus when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileModalOpen(false);
        setIsHelpModalOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const assignedBranch = isBranchUser
    ? branches.find(b => b.id === currentUser?.assignedBranchId)
    : null;

  // Determine page title & subtitle dynamically based on active route
  let pageTitle = 'Head Office Dashboard';
  let pageSubtitle = 'All branches · Customer engagement overview';

  if (location.pathname.startsWith('/pos')) {
    pageTitle = 'Billing (POS) Register';
    pageSubtitle = 'Fast garment barcode checkout, discounts & printed tax invoices';
  } else if (location.pathname.startsWith('/invoices')) {
    pageTitle = 'Invoices & Returns';
    pageSubtitle = 'Sales transactions, GST receipts, and customer return processing';
  } else if (location.pathname.startsWith('/inventory')) {
    pageTitle = 'Stock & Product Catalogue';
    pageSubtitle = 'Master garment SKUs, variants, cost vs MRP & branch stock balances';
  } else if (location.pathname.startsWith('/transfers')) {
    pageTitle = 'Stock Transfers';
    pageSubtitle = 'Inter-branch garment requisitions, in-transit & receipt stock-in';
  } else if (location.pathname.startsWith('/accounting')) {
    pageTitle = 'Store Accounting & Ledger';
    pageSubtitle = 'Cash/bank balances, expense vouchers & day-end register closing';
  } else if (location.pathname.startsWith('/chat-inbox')) {
    pageTitle = 'AI Chatbot';
    pageSubtitle = 'Customer conversations • All branches';
  } else if (location.pathname.startsWith('/leads')) {
    pageTitle = 'Lead Generation';
    pageSubtitle = 'Track and manage potential customers';
  } else if (location.pathname.startsWith('/customers')) {
    pageTitle = 'Customer Database';
    pageSubtitle = 'Manage customers and import from Petpooja';
  } else if (location.pathname.startsWith('/campaigns')) {
    pageTitle = 'WhatsApp Campaigns';
    pageSubtitle = 'Create and manage WhatsApp marketing campaigns across branches';
  } else if (location.pathname.startsWith('/reports')) {
    pageTitle = 'Reports & Insights';
    pageSubtitle = 'Performance metrics & growth analytics';
  } else if (location.pathname.startsWith('/settings')) {
    const isUsersTab = new URLSearchParams(location.search).get('tab') === 'users';
    pageTitle = isUsersTab ? 'Users & Branches' : 'Store Settings';
    pageSubtitle = isUsersTab ? 'Retail branches & role-based user management' : 'System configuration, branches & AI knowledge';
  } else if (!isAdmin) {
    pageTitle = `${assignedBranch?.name || 'Branch'} Dashboard`;
    pageSubtitle = `${assignedBranch?.name || 'Store'} · Branch activity overview`;
  }

  const isChatPage = location.pathname.startsWith('/chat-inbox');

  const handleSignOut = async () => {
    setIsProfileMenuOpen(false);
    await logout();
    showToast('Signed out successfully', 'info');
    navigate('/login', { replace: true });
  };

  const notifications = [
    {
      id: 'notif-1',
      title: 'WhatsApp Campaign Scheduled',
      time: '10 min ago',
      desc: 'Winter Collection Launch broadcast scheduled for 21,530 recipients.',
      unread: true,
    },
    {
      id: 'notif-2',
      title: 'New Lead Captured via Chatbot',
      time: '25 min ago',
      desc: 'Rohit Verma enquired about Wedding Wear collection at Branch 1.',
      unread: true,
    },
    {
      id: 'notif-3',
      title: 'Petpooja Sync Complete',
      time: '2 hrs ago',
      desc: 'Customer records and purchase transactions synchronized successfully.',
      unread: false,
    },
  ];

  return (
    <header className="h-20 bg-transparent px-4 sm:px-6 lg:px-8 flex items-center justify-between select-none relative z-30">
      {/* Left: Page Title & Subtitle matching screenshot */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {pageTitle}
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            {pageSubtitle}
          </p>
        </div>
      </div>

      {/* Right Controls matching reference screenshot */}
      <div className="flex items-center gap-3">
        {/* Branch Context Dropdown */}
        {isAdmin ? (
          <div className="relative">
            <select
              value={activeBranchId}
              onChange={e => {
                setActiveBranchId(e.target.value);
                const selected = branches.find(b => b.id === e.target.value);
                showToast(`Viewing: ${e.target.value === 'ALL' ? 'Head Office (All Branches)' : selected?.name || e.target.value}`, 'info');
              }}
              className="appearance-none pl-8 pr-8 py-2 text-xs font-semibold bg-white text-slate-700 border border-slate-200/90 rounded-xl hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004F4C]/20 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <Store className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        ) : (
          <div className="px-3 py-2 bg-white text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-2">
            <Store className="w-4 h-4 text-[#004F4C]" />
            <span>{assignedBranch?.name || 'Assigned Branch'}</span>
          </div>
        )}

        {/* Online Status Pill for Chatbot */}
        {isChatPage ? (
          <div
            onClick={() => showToast('AI Chatbot status: Online (Ready for incoming enquiries)', 'success')}
            className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold shadow-2xs cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></span>
            <span>Online</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        ) : (
          /* Date Period Dropdown on Dashboard */
          <div className="relative hidden sm:block">
            <select
              defaultValue="THIS_MONTH"
              onChange={e => showToast(`Date filter: ${e.target.options[e.target.selectedIndex].text}`, 'info')}
              className="appearance-none pl-8 pr-8 py-2 text-xs font-semibold bg-white text-slate-700 border border-slate-200/90 rounded-xl hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004F4C]/20 shadow-2xs cursor-pointer"
            >
              <option value="THIS_MONTH">This Month</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="TODAY">Today</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="YEAR">This Financial Year</option>
            </select>
            <Calendar className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Notification Bell with Red Badge */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => {
              setIsNotificationsOpen(prev => !prev);
              setIsProfileMenuOpen(false);
            }}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors shadow-2xs relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 ring-2 ring-white"></span>
          </button>

          {/* Notifications Dropdown Popover */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">Notifications</span>
                <span className="text-[10px] font-semibold bg-[#e6f7f2] text-[#004F4C] px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      showToast(`Opened: ${n.title}`, 'info');
                      setIsNotificationsOpen(false);
                    }}
                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-xs space-y-1 ${
                      n.unread ? 'bg-[#f0f9f7]/40' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11px]">{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    navigate('/reports');
                  }}
                  className="text-[11px] font-semibold text-[#008C83] hover:underline cursor-pointer"
                >
                  View Activity Logs →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Circle Button */}
        <button
          onClick={() => setIsHelpModalOpen(true)}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer hidden md:flex"
          aria-label="Help & Knowledge Base"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Avatar with Profile Dropdown Menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => {
              setIsProfileMenuOpen(prev => !prev);
              setIsNotificationsOpen(false);
            }}
            className="w-9 h-9 rounded-full bg-[#06332b] hover:bg-[#004F4C] text-[#48d597] font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs cursor-pointer transition-colors outline-none focus:ring-2 focus:ring-[#004F4C]/40"
            aria-label="User Account Menu"
          >
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'B'}
          </button>

          {/* Profile Dropdown Popover */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User Identity Header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#06332b] text-[#48d597] font-bold text-sm flex items-center justify-center shrink-0">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'B'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">
                      {currentUser?.name || 'Super Admin'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      {currentUser?.email || 'admin@rsmensworld.com'}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#e6f7f2] text-[#004F4C]">
                      {isAdmin ? 'Super Administrator' : 'Store Manager'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions List */}
              <div className="py-1 text-xs text-slate-700">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Store Settings</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate('/settings?tab=users');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">Users & Branches</span>
                  </button>
                )}
              </div>

              {/* Sign Out Action */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2.5 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 transition-colors font-semibold cursor-pointer text-xs"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Profile Details Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">User Profile Details</h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="w-16 h-16 rounded-full bg-[#06332b] text-[#48d597] font-extrabold text-2xl flex items-center justify-center shadow-md">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'B'}
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">{currentUser?.name || 'Super Admin'}</h4>
                <p className="text-xs text-slate-500 font-mono">{currentUser?.email || 'admin@rsmensworld.com'}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f7f2] text-[#004F4C]">
                  {isAdmin ? 'Super Administrator · Full Access' : 'Store Manager'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Assigned Branch</span>
                <span className="font-bold text-slate-800">{isAdmin ? 'Head Office (All Stores)' : assignedBranch?.name || 'Store Branch'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Security Clearance</span>
                <span className="font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Active Session</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Session Mode</span>
                <span className="font-mono text-slate-700">Client Mock / Demo Mode</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  navigate('/settings');
                }}
                className="px-4 py-2 bg-[#004F4C] hover:bg-[#003d3a] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Open Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#008C83]" />
                <h3 className="font-extrabold text-base text-slate-900">Help & Knowledge Base</h3>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>Welcome to <strong>RS Mens World Customer Engagement & ERP Platform</strong>.</p>
              <div className="bg-[#f0f9f7] p-3.5 rounded-xl border border-[#A8F0D0] space-y-2 text-[#004F4C]">
                <div className="font-bold">Key Module Shortcuts:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li><strong>AI Chatbot:</strong> Manage customer WhatsApp inquiries and create sales leads.</li>
                  <li><strong>Lead Generation:</strong> 4-stage pipeline (New, In Progress, Follow-up, Converted).</li>
                  <li><strong>Customers:</strong> Customer database & Petpooja POS invoice synchronization.</li>
                  <li><strong>Campaigns:</strong> WhatsApp broadcasts with independent branch audience gating.</li>
                </ul>
              </div>
              <p className="text-slate-500 text-[11px]">
                For technical support or backend API integration questions, please contact the development team lead.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-5 py-2 bg-[#004F4C] hover:bg-[#003d3a] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
