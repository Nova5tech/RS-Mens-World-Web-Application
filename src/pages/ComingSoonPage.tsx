import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ComingSoonPageProps {
  title: string;
  moduleName?: string;
  description?: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  title,
  moduleName = 'Operations / Retail',
  description = 'This module is scheduled for development in an upcoming release. Core Customer Engagement features (Chatbot, Leads, Campaigns, Customers) are prioritized first.',
}) => {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-2xl border border-border-card p-8 sm:p-12 shadow-card text-center">
        {/* Soft icon tile */}
        <div className="w-16 h-16 rounded-2xl bg-accent-soft text-primary-brand flex items-center justify-center mb-5 mx-auto shadow-xs">
          <Clock className="w-8 h-8" strokeWidth={1.75} />
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-app-muted text-xs font-semibold mb-3">
          {moduleName}
        </div>

        <h2 className="text-2xl font-bold text-app-text tracking-tight">
          {title} is Coming Soon
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-app-muted max-w-md mx-auto leading-relaxed">
          {description}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/customers"
            className="inline-flex items-center gap-2 h-10 px-4 bg-primary-brand text-white rounded-xl text-xs font-semibold hover:bg-[#0B3B2E] transition-all shadow-sm active:scale-[0.98]"
          >
            <span>Customer Database</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 h-10 px-4 bg-white text-app-text border border-border-card rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all shadow-card active:scale-[0.98]"
          >
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
