import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { WebsiteChatButton } from './WebsiteChatButton';

// Map of route paths to page titles and subtitles matching the application spec
const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Overview of operations and engagement' },
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of operations and engagement' },
  '/billing': { title: 'Billing (POS)', subtitle: 'Point of sale billing system' },
  '/invoices': { title: 'Invoices & Returns', subtitle: 'Manage invoices and customer returns' },
  '/stock-catalogue': { title: 'Stock & Catalogue', subtitle: 'Inventory stock and products catalogue' },
  '/stock-transfers': { title: 'Stock Transfers', subtitle: 'Inter-branch stock transfers and logistics' },
  '/accounting': { title: 'Accounting', subtitle: 'Financial records, ledgers and expenses' },
  '/chatbot': { title: 'AI Chatbot', subtitle: 'Website widget & WhatsApp inbound conversations' },
  '/leads': { title: 'Lead Generation', subtitle: 'Track and manage potential customers' },
  '/customers': { title: 'Customer Database', subtitle: 'Manage customers and import from Petpooja' },
  '/campaigns': { title: 'WhatsApp Campaigns', subtitle: 'Create and run targeted WhatsApp broadcasts' },
  '/reports': { title: 'Reports & Analytics', subtitle: 'Insights on customers, campaigns, leads and chat' },
  '/users-branches': { title: 'Users & Branches', subtitle: 'Manage store branches and staff user accounts' },
  '/settings': { title: 'Settings', subtitle: 'Platform configurations, integrations and preferences' },
};

export const AppShell: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentMeta = PAGE_TITLES[location.pathname] || {
    title: 'RS Mens World',
    subtitle: 'Customer Engagement Platform',
  };

  return (
    <div className="min-h-screen bg-page-bg flex">
      {/* Sidebar navigation */}
      <Sidebar
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Topbar */}
        <Topbar
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8">
          <Outlet />
        </main>
      </div>

      {/* Floating Website Chat Button */}
      <WebsiteChatButton />
    </div>
  );
};
