import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  Plus,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  PackageCheck,
  AlertCircle,
  Eye,
  Store,
  ArrowRight,
  Download,
} from 'lucide-react';
import { transferService } from '../services/transferService.js';
import { useBranch } from '../context/BranchContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDateTime, downloadCSV } from '../utils/formatters.js';
import NewTransferModal from '../components/transfers/NewTransferModal.jsx';
import TransferDetailModal from '../components/transfers/TransferDetailModal.jsx';

export default function TransfersPage() {
  const { branches, activeBranchId, setActiveBranchId } = useBranch();
  const { isBranchUser, currentUser, isAdmin } = useAuth();
  const { showToast } = useToast();

  const effectiveBranch = isBranchUser ? currentUser.assignedBranchId : activeBranchId;

  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const data = await transferService.getTransfers({
        branchId: effectiveBranch,
        status: statusFilter,
      });
      setTransfers(data);
    } catch (err) {
      console.error('Failed to load transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, [effectiveBranch, statusFilter]);

  // Compute metrics
  const totalTransfers = transfers.length;
  const inTransitCount = transfers.filter(t => t.status === 'Dispatched').length;
  const pendingApprovalCount = transfers.filter(t => t.status === 'Requested').length;
  const completedCount = transfers.filter(t => t.status === 'Received').length;

  const filteredTransfers = transfers.filter(t => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      t.id.toLowerCase().includes(q) ||
      t.fromName?.toLowerCase().includes(q) ||
      t.toName?.toLowerCase().includes(q) ||
      t.items?.some(i => i.name.toLowerCase().includes(q))
    );
  });

  const handleExportCSV = () => {
    const rows = filteredTransfers.map(t => ({
      Transfer_ID: t.id,
      Created_Date: t.createdDate,
      Source_Branch: t.fromName || t.from,
      Destination_Branch: t.toName || t.to,
      Items_Summary: t.items?.map(i => `${i.name} (Qty: ${i.qty})`).join('; '),
      Status: t.status,
      Requested_By: t.requestedBy,
      Approved_By: t.approvedBy || '',
    }));
    downloadCSV('RS_Mens_World_Stock_Transfers', rows);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Inter-Branch Stock Transfers
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Store requisitions, dispatch dockets, in-transit tracking & receipt verification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Stock Requisition</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Transfers
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#102333] tracking-tight">
            {totalTransfers}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Inter-store logistics dockets</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              In Transit (Moving)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-700 tracking-tight">
            {inTransitCount}
          </div>
          <p className="text-[11px] text-blue-600 mt-1">En route to destination store</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Pending Approval
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 tracking-tight">
            {pendingApprovalCount}
          </div>
          <p className="text-[11px] text-amber-600 mt-1">Requires Super Admin review</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Received & Stocked
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight">
            {completedCount}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">Successfully transferred into store</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transfer ID, store, or garment item..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs outline-none focus:border-[#008C83]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#f8fbfb] p-1 rounded-xl border border-slate-200">
            {['ALL', 'Requested', 'Approved', 'Dispatched', 'Received'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  statusFilter === st
                    ? 'bg-[#0f766e] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>

          {isAdmin && (
            <select
              value={effectiveBranch}
              onChange={e => setActiveBranchId(e.target.value)}
              className="px-3 py-1.5 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Dense Transfers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#f8fbfb] border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Transfer Docket #</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Source (From)</th>
                <th className="py-3 px-4">Destination (To)</th>
                <th className="py-3 px-4">Garment Items</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No stock transfers match your filter.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map(trf => {
                  let statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Requested
                    </span>
                  );
                  if (trf.status === 'Approved') {
                    statusBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Approved
                      </span>
                    );
                  } else if (trf.status === 'Dispatched') {
                    statusBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-purple-600" />
                        In Transit
                      </span>
                    );
                  } else if (trf.status === 'Received') {
                    statusBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Received & Stocked
                      </span>
                    );
                  }

                  const totalQty = trf.items?.reduce((s, i) => s + (i.qty || 0), 0) || 0;

                  return (
                    <tr key={trf.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#008C83]">
                        {trf.id}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {formatDateTime(trf.createdDate)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {trf.fromName || trf.from}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {trf.toName || trf.to}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800">
                          {totalQty} garments ({trf.items?.length || 1} SKUs)
                        </span>
                        <span className="block text-[11px] text-slate-400 truncate max-w-xs">
                          {trf.items?.map(i => `${i.name} (x${i.qty})`).join(', ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{trf.requestedBy}</td>
                      <td className="py-3 px-4 text-center">{statusBadge}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedTransfer(trf)}
                          className="px-3 py-1.5 rounded-xl bg-[#e6f7f2] hover:bg-[#d0f2e6] text-[#008C83] font-bold text-xs transition-colors cursor-pointer"
                        >
                          View / Process
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Transfer Modal */}
      <NewTransferModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onTransferCreated={loadTransfers}
      />

      {/* Inspect & Process Transfer Modal */}
      <TransferDetailModal
        transfer={selectedTransfer}
        isOpen={Boolean(selectedTransfer)}
        onClose={() => setSelectedTransfer(null)}
        onStatusUpdated={loadTransfers}
      />
    </div>
  );
}
