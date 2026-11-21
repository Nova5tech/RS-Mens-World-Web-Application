import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Segment, SegmentRules, Branch, CustomerType, CustomerStatus } from '@/types/models';
import {
  getSegments,
  createSegment,
  updateSegment,
  deleteSegment,
  previewSegmentCount,
} from '@/services/content';
import { getBranches } from '@/services/branches';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { formatDate } from '@/lib/format';

export const SegmentsTab: React.FC = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer / Builder state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);

  const [form, setForm] = useState({
    name: '',
    rules: {
      branch_id: '' as string | null,
      birthday_month: null as number | null,
      anniversary_month: null as number | null,
      customer_type: 'all' as CustomerType | 'all',
      customer_status: 'all' as CustomerStatus | 'all',
      opted_in_only: true,
    } as SegmentRules,
  });

  const [livePreview, setLivePreview] = useState<{
    totalCount: number;
    branchCounts: Record<string, number>;
  }>({ totalCount: 0, branchCounts: {} });
  const [isPreviewing, setIsPreviewing] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [segList, branchList] = await Promise.all([
        getSegments(),
        getBranches(),
      ]);
      setSegments(segList);
      setBranches(branchList.filter((b) => b.is_active));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update live preview counts whenever rules change
  useEffect(() => {
    if (isDrawerOpen) {
      setIsPreviewing(true);
      previewSegmentCount(form.rules)
        .then((preview) => {
          setLivePreview(preview);
          setIsPreviewing(false);
        })
        .catch(() => setIsPreviewing(false));
    }
  }, [form.rules, isDrawerOpen]);

  const handleOpenAdd = () => {
    setEditingSegment(null);
    setForm({
      name: '',
      rules: {
        branch_id: null,
        birthday_month: null,
        anniversary_month: null,
        customer_type: 'all',
        customer_status: 'all',
        opted_in_only: true,
      },
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (seg: Segment) => {
    setEditingSegment(seg);
    setForm({
      name: seg.name,
      rules: { ...seg.rules_json },
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Segment name is required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingSegment) {
        await updateSegment(editingSegment.id, {
          name: form.name.trim(),
          rules_json: form.rules,
        });
      } else {
        await createSegment({
          name: form.name.trim(),
          rules_json: form.rules,
        });
      }
      setIsDrawerOpen(false);
      await loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save segment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (seg: Segment) => {
    if (confirm(`Delete audience segment "${seg.name}"?`)) {
      await deleteSegment(seg.id);
      await loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-app-text">Customer Audience Segments</h3>
          <p className="text-xs text-app-muted mt-0.5">
            Dynamic audience segments with per-branch matching metrics
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd} className="gap-2 bg-primary-brand">
          <Plus className="w-4 h-4" />
          <span>New Segment</span>
        </Button>
      </div>

      {/* Segments Cards List */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {segments.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-border-card shadow-card p-5 space-y-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-app-text leading-tight">{s.name}</h4>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-app-muted">
                    <span>Created {formatDate(s.created_at)}</span>
                    {s.rules_json.opted_in_only && (
                      <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.2 rounded-full">
                        Opted-in only
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-primary-brand block">
                    {(s.customer_count ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-app-muted uppercase font-semibold">Customers</span>
                </div>
              </div>

              {/* Per-branch audience chips */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Branch Audience Breakdown
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {branches.map((b) => {
                    const count = s.branch_counts?.[b.id] ?? 0;
                    return (
                      <div key={b.id} className="p-2 rounded-xl bg-slate-50 border border-border-card">
                        <span className="font-mono font-bold text-primary-brand block text-[11px]">
                          {b.code}
                        </span>
                        <span className="font-bold text-slate-800 text-xs mt-0.5 block">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(s)} className="gap-1 text-xs">
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Rules</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(s)}
                  className="text-red-600 hover:bg-red-50 border-red-200 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Segment Builder Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingSegment ? 'Edit Audience Segment' : 'Create Audience Segment'}
        subtitle="Configure dynamic segment criteria and evaluate audience size"
        width="w-full sm:w-[500px]"
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
              <span>{editingSegment ? 'Update Segment' : 'Save Segment'}</span>
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-5">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-app-text mb-1">
              Segment Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Birthday in December"
              className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
            />
          </div>

          {/* Live Calculated Audience Counter */}
          <div className="p-4 rounded-2xl bg-[#E6F7EF] border border-[#C6EED9]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-primary-brand block">Live Matched Audience</span>
                <span className="text-[11px] text-slate-600">Calculated across customer database</span>
              </div>
              <div className="text-right">
                {isPreviewing ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary-brand" />
                ) : (
                  <span className="text-2xl font-black text-primary-brand">
                    {livePreview.totalCount}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-emerald-200/60 grid grid-cols-4 gap-2 text-center text-xs">
              {branches.map((b) => (
                <div key={b.id}>
                  <span className="text-[10px] text-slate-500 font-bold block">{b.code}</span>
                  <span className="font-extrabold text-primary-brand">{livePreview.branchCounts[b.id] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3.5">
            <span className="text-xs font-bold text-app-text uppercase tracking-wider block">
              Audience Filter Rules
            </span>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store Branch
              </label>
              <select
                value={form.rules.branch_id || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rules: { ...form.rules, branch_id: e.target.value || null },
                  })
                }
                className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} – {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Birthday Month
                </label>
                <select
                  value={form.rules.birthday_month || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      rules: {
                        ...form.rules,
                        birthday_month: e.target.value ? parseInt(e.target.value, 10) : null,
                      },
                    })
                  }
                  className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl"
                >
                  <option value="">Any Month</option>
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Anniversary Month
                </label>
                <select
                  value={form.rules.anniversary_month || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      rules: {
                        ...form.rules,
                        anniversary_month: e.target.value ? parseInt(e.target.value, 10) : null,
                      },
                    })
                  }
                  className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl"
                >
                  <option value="">Any Month</option>
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Type
                </label>
                <select
                  value={form.rules.customer_type || 'all'}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      rules: {
                        ...form.rules,
                        customer_type: e.target.value as CustomerType | 'all',
                      },
                    })
                  }
                  className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl"
                >
                  <option value="all">All Types</option>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="Repeat">Repeat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Status
                </label>
                <select
                  value={form.rules.customer_status || 'all'}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      rules: {
                        ...form.rules,
                        customer_status: e.target.value as CustomerStatus | 'all',
                      },
                    })
                  }
                  className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active (Last 90d)</option>
                  <option value="new">New (Last 30d)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-border-card flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-app-text block">
                  Opted-in Only (Consent = Yes)
                </span>
                <span className="text-[11px] text-app-muted">
                  Required for promotional campaigns
                </span>
              </div>
              <input
                type="checkbox"
                checked={form.rules.opted_in_only}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rules: { ...form.rules, opted_in_only: e.target.checked },
                  })
                }
                className="w-4 h-4 text-primary-brand rounded border-slate-300 focus:ring-accent-brand"
              />
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
