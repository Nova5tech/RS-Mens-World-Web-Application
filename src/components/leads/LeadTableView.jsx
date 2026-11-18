import React, { useState } from 'react';
import { ArrowUpDown, ChevronRight, Phone, Store } from 'lucide-react';

export default function LeadTableView({ leads, onSelectLead }) {
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = field => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedLeads = [...leads].sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const stageBadges = {
    New: 'bg-[#dcfce7] text-[#15803d]',
    'In Progress': 'bg-[#fef3c7] text-[#b45309]',
    'Follow-up': 'bg-[#ffedd5] text-[#c2410c]',
    Converted: 'bg-[#dcfce7] text-[#15803d]',
    Lost: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="overflow-x-auto select-none">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[11px] font-bold">
            <th className="p-3.5 pl-5">Lead ID</th>
            <th
              className="p-3.5 cursor-pointer hover:text-slate-900"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-1">
                <span>Customer</span>
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
              </div>
            </th>
            <th className="p-3.5">Contact</th>
            <th className="p-3.5">Enquiry</th>
            <th className="p-3.5">Branch</th>
            <th className="p-3.5">Stage</th>
            <th className="p-3.5">Updated</th>
            <th className="p-3.5 pr-5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {sortedLeads.map(lead => (
            <tr
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <td className="p-3.5 pl-5 font-mono text-[11px] text-slate-500 font-medium">
                {lead.id}
              </td>
              <td className="p-3.5 font-bold text-slate-900 group-hover:text-[#0f766e] transition-colors">
                {lead.name}
              </td>
              <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{lead.mobile || '—'}</span>
                </div>
              </td>
              <td className="p-3.5 text-slate-600 max-w-xs truncate">
                {lead.enquiry}
              </td>
              <td className="p-3.5 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Store className="w-3 h-3 text-slate-400" />
                  <span>{lead.branchLabel || lead.preferredBranchId}</span>
                </div>
              </td>
              <td className="p-3.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    stageBadges[lead.stage] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {lead.stage}
                </span>
              </td>
              <td className="p-3.5 text-slate-400 text-[11px] font-medium">
                {lead.timeAgo || 'Today'}
              </td>
              <td className="p-3.5 pr-5 text-right">
                <button className="text-slate-400 group-hover:text-[#0f766e] transition-colors p-1">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
