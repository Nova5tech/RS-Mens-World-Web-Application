import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  ArrowLeftRight,
  DollarSign,
  Bot,
  Target,
  Users,
  Megaphone,
  BarChart3,
  Building2,
  Settings,
  LogOut,
  Store,
  ChevronDown,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBranchContext } from '@/contexts/BranchContext';
import { useAuth } from '@/features/auth/useAuth';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  isComingSoon?: boolean;
  adminOnly?: boolean;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    groupName: 'OPERATIONS',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Billing (POS)', path: '/billing', icon: ShoppingCart, isComingSoon: true },
      { name: 'Invoices & Returns', path: '/invoices', icon: Receipt, isComingSoon: true },
    ],
  },
  {
    groupName: 'INVENTORY',
    items: [
      { name: 'Stock & Catalogue', path: '/stock-catalogue', icon: Package, isComingSoon: true },
      { name: 'Stock Transfers', path: '/stock-transfers', icon: ArrowLeftRight, isComingSoon: true },
    ],
  },
  {
    groupName: 'FINANCE',
    items: [
      { name: 'Accounting', path: '/accounting', icon: DollarSign, isComingSoon: true },
    ],
  },
  {
    groupName: 'CUSTOMER ENGAGEMENT',
    items: [
      { name: 'AI Chatbot', path: '/chatbot', icon: Bot },
      { name: 'Lead Generation', path: '/leads', icon: Target },
      { name: 'Customers', path: '/customers', icon: Users },
      { name: 'WhatsApp Campaigns', path: '/campaigns', icon: Megaphone },
    ],
  },
  {
    groupName: 'INSIGHTS & CONTROL',
    items: [
      { name: 'Reports', path: '/reports', icon: BarChart3 },
      { name: 'Users & Branches', path: '/users-branches', icon: Building2, adminOnly: true },
      { name: 'Settings', path: '/settings', icon: Settings, adminOnly: true },
    ],
  },
];

// Custom Hanger icon matching target brand design
export const HangerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('w-6 h-6 stroke-accent-brand', className)}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Hanger Hook */}
    <path d="M14 8C14 6 15 4.5 16.5 4.5C18 4.5 19 5.5 19 7C19 9 14 10 14 12" />
    {/* Hanger Triangle Body */}
    <path d="M14 12L3.5 18C2.5 18.6 2.8 20 4 20H24C25.2 20 25.5 18.6 24.5 18L14 12Z" />
  </svg>
);

export interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { sidebarChipText, isLocked } = useBranchContext();
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U';
  const userSubtitle =
    role === 'super_admin' ? 'Head Office' : (user?.branch_name || sidebarChipText);

  // Filter groups according to user role (hide admin-only items for branch users)
  const filteredNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.adminOnly && role !== 'super_admin') {
          return false;
        }
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar-bg text-slate-200 select-none">
      {/* Top Header: Brand & Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#082C22] flex items-center justify-center shadow-inner border border-emerald-800/40">
              <HangerIcon className="w-5 h-5 text-accent-brand" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
                RS Mens World
              </h1>
              <p className="text-[11px] font-medium text-emerald-400/80 leading-tight">
                Customer Engagement Platform
              </p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Branch Chip below logo */}
        <div className="mt-4 px-3 py-2 rounded-xl bg-[#072B21] border border-emerald-900/60 flex items-center justify-between text-xs text-white shadow-sm">
          <div className="flex items-center gap-2 truncate">
            <Store className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-medium truncate">{sidebarChipText}</span>
          </div>
          {!isLocked && <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
        </div>
      </div>

      {/* Navigation Groups List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 scrollbar-thin">
        {filteredNavGroups.map((group) => (
          <div key={group.groupName} className="space-y-1">
            <div className="px-3 text-[10px] font-bold tracking-wider text-emerald-500/70 uppercase">
              {group.groupName}
            </div>
            <div className="space-y-0.5 pt-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150',
                        isActive
                          ? 'bg-accent-brand text-[#0B3B2E] font-semibold shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={cn(
                              'w-4 h-4 transition-colors flex-shrink-0',
                              isActive
                                ? 'text-[#0B3B2E]'
                                : 'text-slate-400 group-hover:text-white'
                            )}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.isComingSoon && (
                          <span
                            className={cn(
                              'text-[10px] px-1.5 py-0.2 rounded-md font-normal',
                              isActive
                                ? 'bg-[#0B3B2E]/10 text-[#0B3B2E]'
                                : 'bg-emerald-950/80 text-emerald-400/80'
                            )}
                          >
                            Soon
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom User Card */}
      <div className="p-3 border-t border-emerald-950/80 bg-[#082A20]/80">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-accent-brand/20 border border-accent-brand/40 flex items-center justify-center text-accent-brand font-bold text-xs flex-shrink-0">
              {userInitial}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white leading-tight truncate">
                {user?.full_name || 'Logged In User'}
              </div>
              <div className="text-[11px] text-slate-400 leading-tight truncate">
                {userSubtitle}
              </div>
            </div>
          </div>
          <button
            type="button"
            title="Log out"
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-30 shadow-md">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-sidebar-bg z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
