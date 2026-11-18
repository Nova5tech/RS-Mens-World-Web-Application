import React, { useState, useEffect } from 'react';
import { X, Save, Clock, MessageSquare, Tag, ShieldCheck, User } from 'lucide-react';
import { LeadStages, LeadPriorities, LeadCategories } from '../../types/index.js';
import { useBranch } from '../../context/BranchContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDateTime } from '../../utils/formatters.js';

export default function LeadDrawer({ lead, isOpen, onClose, onUpdateLead }) {
  if (!isOpen || !lead) return null;

  const { branches } = useBranch();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [stage, setStage] = useState(lead.stage);
  const [priority, setPriority] = useState(lead.priority);
  const [category, setCategory] = useState(lead.aiCategory || 'General Enquiry');
  const [followUpDate, setFollowUpDate] = useState(
    lead.followUpDate ? lead.followUpDate.slice(0, 16) : ''
  );
  const [assignedTo, setAssignedTo] = useState(lead.assignedTo || 'Unassigned');
  const [assignedBranchId, setAssignedBranchId] = useState(
    lead.assignedBranchId || lead.preferredBranchId || 'B1'
  );
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStage(lead.stage);
    setPriority(lead.priority);
    setCategory(lead.aiCategory || 'General Enquiry');
    setFollowUpDate(lead.followUpDate ? lead.followUpDate.slice(0, 16) : '');
    setAssignedTo(lead.assignedTo || 'Unassigned');
    setAssignedBranchId(lead.assignedBranchId || lead.preferredBranchId || 'B1');
  }, [lead]);

  const handleSaveDetails = async () => {
    try {
      setSaving(true);
      await onUpdateLead(lead.id, {
        stage,
        priority,
        aiCategory: category,
        followUpDate: followUpDate || null,
        assignedTo,
        assignedBranchId,
      });
      showToast('Client record updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update lead', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async e => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const updatedNotes = [
        {
          id: `note-${Date.now()}`,
          text: newNote.trim(),
          author: currentUser.name,
          timestamp: new Date().toISOString(),
        },
        ...(lead.notes || []),
      ];

      await onUpdateLead(lead.id, { notes: updatedNotes });
      setNewNote('');
      showToast('Note added', 'success');
    } catch (err) {
      showToast('Failed to record note', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#062b24]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-float border-l border-[#D9E9E8] flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#D9E9E8] bg-[#f8fbfb] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">{lead.name}</h3>
              <span className="font-mono text-xs font-semibold text-slate-400">#{lead.id}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Source: {lead.source} • {formatDateTime(lead.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs font-sans">
          {/* Stage Progression Bar */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Pipeline Stage
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {LeadStages.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStage(s)}
                  className={`py-1.5 px-2 rounded-xl text-xs text-center border font-semibold transition-all cursor-pointer ${
                    stage === s
                      ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-2xs'
                      : 'bg-[#f8fbfb] text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Classification Section */}
          <div className="p-4 bg-[#f8fbfb] rounded-2xl border border-slate-200/80 space-y-3">
            <span className="font-bold text-xs text-slate-900 block">Customer Enquiry</span>
            <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100">
              "{lead.aiSummary || lead.enquiry}"
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0f766e]"
                >
                  {LeadCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0f766e]"
                >
                  {LeadPriorities.map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Store Branch & Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#f8fbfb] border border-slate-200/80 rounded-2xl">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Store Branch</label>
              <select
                value={assignedBranchId}
                onChange={e => setAssignedBranchId(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0f766e]"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Assigned Staff</label>
              <input
                type="text"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0f766e]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Scheduled Follow-up</label>
              <input
                type="datetime-local"
                value={followUpDate}
                onChange={e => setFollowUpDate(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl outline-none font-mono focus:border-[#0f766e]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveDetails}
            disabled={saving}
            className="w-full py-2.5 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Lead Updates'}</span>
          </button>

          {/* Notes Section */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Follow-up Activity Notes
            </span>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Add private follow-up note..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="flex-1 text-xs px-3 py-2 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#0f766e]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
              >
                Post
              </button>
            </form>

            <div className="space-y-2">
              {(lead.notes || []).map(note => (
                <div
                  key={note.id}
                  className="p-3 bg-[#f8fbfb] rounded-xl border border-slate-200/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="font-semibold text-slate-700">{note.author}</span>
                    <span>{formatDateTime(note.timestamp)}</span>
                  </div>
                  <p className="text-slate-700 font-sans">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
