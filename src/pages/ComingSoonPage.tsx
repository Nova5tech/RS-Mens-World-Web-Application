import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';

export interface ComingSoonPageProps {
  title: string;
  moduleName?: string;
  description?: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  title,
  moduleName = 'Operations / ERP',
  description = 'This module is scheduled for development in an upcoming release. Core Customer Engagement features (Chatbot, Leads, Campaigns, Customers) are prioritized first.',
}) => {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card className="border-dashed border-2 border-slate-200 shadow-sm text-center">
        <CardContent className="py-16 px-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 shadow-sm border border-amber-100">
            <Clock className="w-8 h-8" />
          </div>

          <Pill variant="amber" size="md" className="mb-3">
            {moduleName}
          </Pill>

          <h2 className="text-xl font-bold text-app-text">{title} is Coming Soon</h2>

          <p className="mt-2 text-xs sm:text-sm text-app-muted max-w-md leading-relaxed">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/customers"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-brand text-white rounded-lg text-xs font-semibold hover:bg-[#0c3e2f] transition-colors shadow-sm"
            >
              <span>Explore Customer Database</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="/leads"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-app-text border border-border-card rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <span>View Lead Generation</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
