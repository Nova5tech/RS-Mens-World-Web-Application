import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import MobileDrawer from '../components/layout/MobileDrawer.jsx';
import CustomerChatWidget from '../components/chat/CustomerChatWidget.jsx';
import AddLeadModal from '../components/leads/AddLeadModal.jsx';
import { leadService } from '../services/leadService.js';
import { useToast } from '../context/ToastContext.jsx';
import { MessageSquare } from 'lucide-react';

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);
  const [isGlobalAddLeadOpen, setIsGlobalAddLeadOpen] = useState(false);
  const { showToast } = useToast();

  const handleGlobalCreateLead = async leadData => {
    await leadService.createLead(leadData);
    showToast('Lead created successfully', 'success');
  };

  return (
    <div className="flex h-screen bg-[#F5FAFA] text-slate-800 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile / Tablet Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <TopBar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onToggleChatWidget={() => setIsChatWidgetOpen(prev => !prev)}
          isChatWidgetOpen={isChatWidgetOpen}
        />

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet
            context={{
              openGlobalAddLead: () => setIsGlobalAddLeadOpen(true),
              toggleChatPreview: () => setIsChatWidgetOpen(prev => !prev),
            }}
          />
        </main>
      </div>

      {/* Floating Website Visitor Chat Trigger */}
      {!isChatWidgetOpen && (
        <button
          onClick={() => setIsChatWidgetOpen(true)}
          className="fixed bottom-6 right-6 px-4 py-2.5 rounded-full bg-[#062b24] text-[#48d597] border border-[#0d3d34] font-semibold text-xs shadow-float hover:bg-[#083b32] transition-all flex items-center gap-2 z-40 cursor-pointer"
          aria-label="Open website chat concierge"
        >
          <span className="w-2 h-2 rounded-full bg-[#48d597] animate-pulse"></span>
          <span>Website Chat</span>
        </button>
      )}

      {/* Floating Website Visitor Chat Widget */}
      <CustomerChatWidget
        isOpen={isChatWidgetOpen}
        onClose={() => setIsChatWidgetOpen(false)}
      />

      {/* Global Add Lead Modal */}
      <AddLeadModal
        isOpen={isGlobalAddLeadOpen}
        onClose={() => setIsGlobalAddLeadOpen(false)}
        onCreateLead={handleGlobalCreateLead}
      />
    </div>
  );
}
