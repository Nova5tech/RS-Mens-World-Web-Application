import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Megaphone,
  BarChart3,
  Settings,
  Store,
  LogOut,
  ChevronDown,
  Target,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBranch } from '../../context/BranchContext.jsx';

export default function Sidebar({ onClose }) {
  const { currentUser, isAdmin, isBranchUser, logout } = useAuth();
  const { branches, activeBranchId, setActiveBranchId } = useBranch();
  const navigate = useNavigate();

  const assignedBranch = isBranchUser
    ? branches.find(b => b.id === currentUser?.assignedBranchId)
    : null;

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'CUSTOMER ENGAGEMENT',
      items: [
        { to: '/chat-inbox', label: 'AI Chatbot', icon: MessageSquare },
        { to: '/leads', label: 'Lead Generation', icon: Target },
        { to: '/customers', label: 'Customers', icon: Users },
        { to: '/campaigns', label: 'WhatsApp Campaigns', icon: Megaphone },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        { to: '/reports', label: 'Reports', icon: BarChart3 },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { to: '/settings?tab=users', label: 'Users & Branches', icon: Shield, adminOnly: true },
        { to: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-[#062b24] text-slate-200 flex flex-col h-full select-none border-r border-[#0d3d34]">
      {/* Brand Header matching screenshot */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          {/* Mint Coat Hanger Icon */}
          <svg
            className="w-8 h-8 text-[#48d597] shrink-0"
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
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
              RS Mens World
            </h1>
            <p className="text-[11px] text-[#a7f3d0] font-sans">
              Customer Engagement Platform
            </p>
          </div>
        </div>

        {/* Store / Head Office Selector Pill */}
        <div className="mt-4">
          {isAdmin ? (
            <div className="relative">
              <select
                value={activeBranchId}
                onChange={e => setActiveBranchId(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2 text-xs font-semibold bg-[#0a3830] text-white border border-[#165045] rounded-xl hover:border-[#217364] focus:outline-none focus:ring-1 focus:ring-[#48d597] cursor-pointer"
              >
                <option value="ALL">Head Office</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <Store className="w-4 h-4 text-[#48d597] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ) : (
            <div className="w-full px-3 py-2 bg-[#0a3830] text-white border border-[#165045] rounded-xl text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <Store className="w-4 h-4 text-[#48d597] shrink-0" />
                <span className="truncate">{assignedBranch?.name || 'Assigned Branch'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
        {navSections.map(section => {
          const visibleItems = section.items.filter(item => !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#6ba89b]">
                {section.title}
              </div>
              {visibleItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to + item.label}
                    to={item.to}
                    onClick={onClose}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#48d597] text-[#062b24] font-bold shadow-sm'
                          : 'text-slate-300 hover:bg-[#0c4036] hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#062b24]' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User profile footer matching reference screenshot */}
      <div className="p-3.5 border-t border-[#0d3d34] bg-[#05231d] flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#12584c] border border-[#217364] flex items-center justify-center font-bold text-xs text-[#48d597] shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'B'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {currentUser?.name || 'Super Admin'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {isAdmin ? 'Head Office' : assignedBranch?.name || 'Store Branch'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-[#0c4036] rounded-lg transition-colors cursor-pointer"
          aria-label="Sign out of system"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
