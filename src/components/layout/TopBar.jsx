import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  Store,
  Calendar,
  Bell,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBranch } from '../../context/BranchContext.jsx';

export default function TopBar({ onOpenMobileMenu }) {
  const location = useLocation();
  const { currentUser, isAdmin, isBranchUser } = useAuth();
  const { branches, activeBranchId, setActiveBranchId } = useBranch();

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

  return (
    <header className="h-20 bg-transparent px-4 sm:px-6 lg:px-8 flex items-center justify-between select-none">
      {/* Left: Page Title & Subtitle matching screenshot */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
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
              onChange={e => setActiveBranchId(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 text-xs font-semibold bg-white text-slate-700 border border-slate-200/90 rounded-xl hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 shadow-2xs cursor-pointer"
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
            <Store className="w-4 h-4 text-[#0f766e]" />
            <span>{assignedBranch?.name || 'Assigned Branch'}</span>
          </div>
        )}

        {/* Online Status Pill for Chatbot (matching AI Chatbot screenshot) */}
        {isChatPage ? (
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold shadow-2xs cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
            <span>Online</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        ) : (
          /* Date Period Dropdown on Dashboard */
          <div className="relative hidden sm:block">
            <select
              defaultValue="THIS_MONTH"
              className="appearance-none pl-8 pr-8 py-2 text-xs font-semibold bg-white text-slate-700 border border-slate-200/90 rounded-xl hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 shadow-2xs cursor-pointer"
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
        <button
          className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors shadow-2xs relative cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 ring-2 ring-white"></span>
        </button>

        {/* Help Circle */}
        <button
          className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer hidden md:flex"
          aria-label="Help & Knowledge Base"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Avatar Circle matching screenshot */}
        <div className="w-9 h-9 rounded-full bg-[#06332b] text-[#48d597] font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs">
          {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'B'}
        </div>
      </div>
    </header>
  );
}
