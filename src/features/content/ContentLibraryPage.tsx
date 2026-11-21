import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, MessageSquare, Users } from 'lucide-react';
import { MediaLibraryTab } from './MediaLibraryTab';
import { TemplatesTab } from './TemplatesTab';
import { SegmentsTab } from './SegmentsTab';
import { getMedia, getTemplates, getSegments } from '@/services/content';
import { cn } from '@/lib/utils';

export const ContentLibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'media' | 'templates' | 'segments'>('templates');
  const [counts, setCounts] = useState({ media: 0, templates: 0, segments: 0 });

  useEffect(() => {
    Promise.all([getMedia(), getTemplates(), getSegments()]).then(
      ([media, templates, segments]) => {
        setCounts({
          media: media.length,
          templates: templates.length,
          segments: segments.length,
        });
      }
    );
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-app-text tracking-tight">Content Library</h1>
        <p className="text-sm text-app-muted mt-1">
          Manage promotional media posters, WhatsApp message templates, and customer audience segments
        </p>
      </div>

      {/* Tabs with Counts */}
      <div className="flex items-center gap-2 border-b border-border-card pb-4">
        <button
          type="button"
          onClick={() => setActiveTab('media')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'media'
              ? 'bg-primary-brand text-white shadow-sm'
              : 'bg-white text-slate-700 border border-border-card hover:bg-slate-50'
          )}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Media Assets</span>
          <span
            className={cn(
              'text-[11px] px-2 py-0.5 rounded-full font-bold',
              activeTab === 'media' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            )}
          >
            {counts.media}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'templates'
              ? 'bg-primary-brand text-white shadow-sm'
              : 'bg-white text-slate-700 border border-border-card hover:bg-slate-50'
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Message Templates</span>
          <span
            className={cn(
              'text-[11px] px-2 py-0.5 rounded-full font-bold',
              activeTab === 'templates' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            )}
          >
            {counts.templates}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('segments')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'segments'
              ? 'bg-primary-brand text-white shadow-sm'
              : 'bg-white text-slate-700 border border-border-card hover:bg-slate-50'
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Audience Segments</span>
          <span
            className={cn(
              'text-[11px] px-2 py-0.5 rounded-full font-bold',
              activeTab === 'segments' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            )}
          >
            {counts.segments}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'media' && <MediaLibraryTab />}
      {activeTab === 'templates' && <TemplatesTab />}
      {activeTab === 'segments' && <SegmentsTab />}
    </div>
  );
};
