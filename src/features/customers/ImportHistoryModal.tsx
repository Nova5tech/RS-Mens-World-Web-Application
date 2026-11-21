import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet } from 'lucide-react';
import { ImportBatch } from '@/types/models';
import { getImportBatches } from '@/services/customers';
import { Pill } from '@/components/ui/Pill';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/format';

export interface ImportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportHistoryModal: React.FC<ImportHistoryModalProps> = ({ isOpen, onClose }) => {
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getImportBatches()
        .then((data) => {
          setBatches(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-border-card bg-[#F8FAFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-soft text-primary-brand flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-app-text">Petpooja Import History</h3>
              <p className="text-xs text-app-muted">Review past customer batch imports and status</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-8 text-center text-xs text-app-muted">Loading import history...</div>
          ) : batches.length === 0 ? (
            <div className="py-10 text-center text-xs text-app-muted">No past import batches recorded yet.</div>
          ) : (
            <div className="border border-border-card rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFA] text-slate-600 font-semibold border-b border-border-card">
                  <tr>
                    <th className="p-3">File Name</th>
                    <th className="p-3">Uploaded By</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-center">Total</th>
                    <th className="p-3 text-center">Created</th>
                    <th className="p-3 text-center">Updated</th>
                    <th className="p-3 text-center">Skipped</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-card">
                  {batches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-app-text truncate max-w-xs" title={b.file_name}>
                        {b.file_name}
                      </td>
                      <td className="p-3 text-slate-700">{b.uploaded_by}</td>
                      <td className="p-3 text-slate-600">{formatDate(b.uploaded_at)}</td>
                      <td className="p-3 text-center font-bold">{b.total}</td>
                      <td className="p-3 text-center text-emerald-700 font-bold">+{b.created}</td>
                      <td className="p-3 text-center text-blue-700 font-bold">{b.updated}</td>
                      <td className="p-3 text-center text-slate-500 font-medium">{b.duplicates + b.invalid}</td>
                      <td className="p-3 text-right">
                        <Pill variant="green" dot>Completed</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-border-card bg-slate-50 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
