import React from 'react';
import { Store, Phone, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Lead } from '@/types/models';
import { formatPhone } from '@/lib/phone';

interface LeadTableProps {
  leads: Lead[];
  selectedLeadId?: string;
  onSelectLead: (lead: Lead) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  selectedLeadId,
  onSelectLead,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}) => {
  const branchLabels: Record<string, string> = {
    branch_1: 'Branch 1',
    branch_2: 'Branch 2',
    branch_3: 'Branch 3',
    branch_4: 'Branch 4',
  };

  const stageBadgeClasses: Record<string, string> = {
    new: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200/60',
    follow_up: 'bg-orange-50 text-orange-700 border-orange-200/60',
    converted: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    lost: 'bg-rose-50 text-rose-700 border-rose-200/60',
  };

  const stageLabels: Record<string, string> = {
    new: 'New',
    in_progress: 'In Progress',
    follow_up: 'Follow-up',
    converted: 'Converted',
    lost: 'Lost',
  };

  const isAllSelected = leads.length > 0 && selectedIds.length === leads.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-600">
              <th className="py-3.5 pl-4 pr-2 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-gray-300 text-[#0F4C3A] focus:ring-[#0F4C3A] h-4 w-4"
                />
              </th>
              <th className="py-3.5 px-3">Lead ID</th>
              <th className="py-3.5 px-3 cursor-pointer select-none">
                <div className="flex items-center gap-1 hover:text-gray-900">
                  <span>Customer</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3.5 px-3">Contact</th>
              <th className="py-3.5 px-3">Enquiry</th>
              <th className="py-3.5 px-3">Branch</th>
              <th className="py-3.5 px-3">Stage</th>
              <th className="py-3.5 px-3">Updated</th>
              <th className="py-3.5 pr-4 pl-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-500 text-sm">
                  No leads found matching current filters
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const isSelected = lead.id === selectedLeadId;
                const isChecked = selectedIds.includes(lead.id);
                const cleanPhone = lead.phone.replace(/\D/g, '');

                const updatedDateStr = lead.stage === 'converted'
                  ? 'Completed'
                  : new Date(lead.updated_at || lead.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#E6F7EF]/30' : ''
                    }`}
                  >
                    <td className="py-3 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleSelect(lead.id)}
                        className="rounded border-gray-300 text-[#0F4C3A] focus:ring-[#0F4C3A] h-4 w-4"
                      />
                    </td>
                    <td className="py-3 px-3 font-mono text-xs font-semibold text-gray-700">
                      {lead.id}
                    </td>
                    <td className="py-3 px-3 font-semibold text-gray-900">
                      {lead.customer_name}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-gray-600" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`tel:${cleanPhone}`}
                        className="inline-flex items-center gap-1.5 hover:text-[#0F4C3A]"
                      >
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatPhone(lead.phone)}</span>
                      </a>
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-600 max-w-xs truncate">
                      {lead.enquiry}
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-600 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-gray-400" />
                        <span>{branchLabels[lead.branch_id] || lead.branch_id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          stageBadgeClasses[lead.stage] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {stageLabels[lead.stage] || lead.stage}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">
                      {updatedDateStr}
                    </td>
                    <td className="py-3 pr-4 pl-2 text-right">
                      <ChevronRight className="w-4 h-4 text-gray-400 inline" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {total > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500">
          <div>
            Showing <span className="font-semibold text-gray-900">{Math.min(1 + (page - 1) * pageSize, total)}</span> to{' '}
            <span className="font-semibold text-gray-900">{Math.min(page * pageSize, total)}</span> of{' '}
            <span className="font-semibold text-gray-900">{total}</span> leads
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="font-medium text-gray-700 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
