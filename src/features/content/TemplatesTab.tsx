import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { MessageTemplate, TemplateCategory, MetaTemplateStatus } from '@/types/models';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/services/content';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Drawer } from '@/components/ui/Drawer';

export const TemplatesTab: React.FC = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer / Editor state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  const [form, setForm] = useState({
    name: '',
    category: 'Promotional' as TemplateCategory,
    body: '',
    meta_template_name: '',
    meta_status: 'Approved' as MetaTemplateStatus,
    header_image_url: '',
    cta_text: 'Visit Nearest Store',
    cta_url: 'https://rsmensworld.com/stores',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await getTemplates();
      setTemplates(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setForm({
      name: '',
      category: 'Promotional',
      body: 'Hello {{customer_name}}! Welcome to RS Mens World {{branch_name}}. Enjoy {{offer_text}} on our new arrivals today!',
      meta_template_name: `promo_${Date.now().toString().slice(-4)}`,
      meta_status: 'Approved',
      header_image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
      cta_text: 'Visit Nearest Store',
      cta_url: 'https://rsmensworld.com/stores',
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (t: MessageTemplate) => {
    setEditingTemplate(t);
    setForm({
      name: t.name,
      category: t.category,
      body: t.body,
      meta_template_name: t.meta_template_name,
      meta_status: t.meta_status,
      header_image_url: t.header_image_url || '',
      cta_text: t.cta_text || '',
      cta_url: t.cta_url || '',
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleInsertVariable = (variableTag: string) => {
    setForm((prev) => ({
      ...prev,
      body: prev.body + ` {{${variableTag}}} `,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Template name is required');
      return;
    }
    if (!form.body.trim()) {
      setFormError('Message body is required');
      return;
    }

    // Extract variables used in body
    const matches = form.body.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
    const variables = Array.from(new Set(matches.map((m) => m.replace(/[\{\}]/g, ''))));

    setIsSaving(true);
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, {
          name: form.name.trim(),
          category: form.category,
          body: form.body.trim(),
          variables,
          meta_template_name: form.meta_template_name.trim(),
          meta_status: form.meta_status,
          header_image_url: form.header_image_url.trim() || undefined,
          cta_text: form.cta_text.trim() || undefined,
          cta_url: form.cta_url.trim() || undefined,
        });
      } else {
        await createTemplate({
          name: form.name.trim(),
          category: form.category,
          body: form.body.trim(),
          variables,
          meta_template_name: form.meta_template_name.trim() || `tpl_${Date.now()}`,
          meta_status: form.meta_status,
          header_image_url: form.header_image_url.trim() || undefined,
          cta_text: form.cta_text.trim() || undefined,
          cta_url: form.cta_url.trim() || undefined,
        });
      }
      setIsDrawerOpen(false);
      await loadTemplates();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (t: MessageTemplate) => {
    if (confirm(`Delete message template "${t.name}"?`)) {
      await deleteTemplate(t.id);
      await loadTemplates();
    }
  };

  // Preview formatted text with sample customer variables
  const previewBody = form.body
    .replace(/\{\{customer_name\}\}/g, 'Rahul Kumar')
    .replace(/\{\{branch_name\}\}/g, 'Rajahmundry Main Branch')
    .replace(/\{\{offer_text\}\}/g, 'Flat 20% OFF');

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-app-text">WhatsApp Message Templates</h3>
          <p className="text-xs text-app-muted mt-0.5">
            Pre-approved Meta WhatsApp Cloud API templates with dynamic variables
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd} className="gap-2 bg-primary-brand">
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </Button>
      </div>

      {/* Templates Table */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border-card shadow-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFA] text-slate-600 font-semibold border-b border-border-card uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Template Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Meta Status</th>
                <th className="py-3.5 px-4">Variables</th>
                <th className="py-3.5 px-4">Meta Identifier</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-card">
              {templates.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-app-text text-sm">{t.name}</div>
                    <div className="text-[11px] text-app-muted truncate max-w-sm mt-0.5">{t.body}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {t.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {t.meta_status === 'Approved' && <Pill variant="green" dot>Approved</Pill>}
                    {t.meta_status === 'Pending' && <Pill variant="amber" dot>Pending</Pill>}
                    {t.meta_status === 'Rejected' && <Pill variant="red" dot>Rejected</Pill>}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {t.variables.map((v) => (
                        <span key={v} className="px-2 py-0.5 bg-slate-100 font-mono text-[10px] rounded text-slate-700">
                          {`{{${v}}}`}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                    {t.meta_template_name}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 text-slate-400 hover:text-primary-brand rounded hover:bg-slate-100 cursor-pointer"
                        title="Edit template"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 cursor-pointer"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Template Editor Drawer with Live WhatsApp Phone Preview */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingTemplate ? 'Edit Message Template' : 'Create Message Template'}
        subtitle="Compose message body, insert variable tags, and inspect live preview"
        width="w-full sm:w-[860px]"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" type="button" onClick={() => setIsDrawerOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary-brand"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              <span>{editingTemplate ? 'Update Template' : 'Save Template'}</span>
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Template Form Fields */}
          <form onSubmit={handleSave} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-app-text mb-1">
                Template Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Winter Collection Launch"
                className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-app-text mb-1">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as TemplateCategory })}
                  className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl"
                >
                  <option value="Promotional">Promotional</option>
                  <option value="Greeting">Greeting</option>
                  <option value="Festival">Festival</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Announcement">Announcement</option>
                  <option value="Loyalty">Loyalty</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-text mb-1">
                  Meta Approval Status
                </label>
                <select
                  value={form.meta_status}
                  onChange={(e) => setForm({ ...form, meta_status: e.target.value as MetaTemplateStatus })}
                  className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl"
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-text mb-1">
                Header Image URL (Optional)
              </label>
              <input
                type="text"
                value={form.header_image_url}
                onChange={(e) => setForm({ ...form, header_image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-app-text">
                  Message Body *
                </label>
                <span className="text-[11px] text-app-muted">Click chip to insert:</span>
              </div>

              {/* Variable Chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {['customer_name', 'branch_name', 'offer_text'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleInsertVariable(v)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-primary-brand text-[11px] font-semibold font-mono border border-emerald-200 transition-colors cursor-pointer"
                  >
                    + {`{{${v}}}`}
                  </button>
                ))}
              </div>

              <textarea
                rows={5}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Type your WhatsApp message template here..."
                className="w-full p-3 text-xs bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand font-sans leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-app-text mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={form.cta_text}
                  onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                  placeholder="e.g. Visit Store"
                  className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-text mb-1">
                  CTA Button URL
                </label>
                <input
                  type="text"
                  value={form.cta_url}
                  onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl"
                />
              </div>
            </div>
          </form>

          {/* Right: Live WhatsApp Phone Preview matching 05-campaigns-wizard.png */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Live WhatsApp Preview
            </span>

            {/* Mobile frame container */}
            <div className="w-[300px] rounded-[36px] bg-[#111B21] p-3 shadow-2xl border-[4px] border-slate-700 text-slate-800">
              {/* Phone top notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

              {/* Chat Header */}
              <div className="bg-[#0B3B2E] text-white px-3 py-2.5 rounded-t-2xl flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-accent-brand flex items-center justify-center text-[#0B3B2E] font-bold text-xs flex-shrink-0">
                  RS
                </div>
                <div className="truncate flex-1">
                  <div className="text-xs font-bold leading-tight truncate">RS Mens World</div>
                  <div className="text-[10px] text-accent-brand leading-none">Official Business</div>
                </div>
              </div>

              {/* Chat Message Canvas */}
              <div className="bg-[#EFEAE2] min-h-[360px] p-2.5 rounded-b-2xl flex flex-col justify-end">
                {/* Message Bubble */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden text-xs max-w-[260px] border border-slate-100">
                  {/* Optional Header Image */}
                  {form.header_image_url && (
                    <div className="h-32 bg-slate-100 overflow-hidden">
                      <img
                        src={form.header_image_url}
                        alt="Header"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="p-3 space-y-2">
                    <p className="text-slate-800 text-[11px] leading-relaxed whitespace-pre-wrap">
                      {previewBody}
                    </p>

                    <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                      <span>10:30 AM</span>
                      <span className="text-accent-brand font-bold">✓✓</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  {form.cta_text && (
                    <div className="border-t border-slate-100 px-3 py-2 bg-slate-50/50 text-center">
                      <span className="text-xs font-semibold text-primary-brand flex items-center justify-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{form.cta_text}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
