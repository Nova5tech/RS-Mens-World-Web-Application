import React from 'react';
import { X } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

export default function MobileDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#062b24]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#062b24] shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#083b32] border border-[#0d453b]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar onClose={onClose} />
      </div>
    </div>
  );
}
