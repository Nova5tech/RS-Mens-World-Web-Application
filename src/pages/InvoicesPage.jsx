import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Plus,
  Eye,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Download,
  Store,
  Filter,
} from 'lucide-react';
import { posService } from '../services/posService.js';
import { useBranch } from '../context/BranchContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatCurrency, formatDateTime, downloadCSV } from '../utils/formatters.js';
import InvoiceReceiptModal from '../components/pos/InvoiceReceiptModal.jsx';
import SalesReturnModal from '../components/pos/SalesReturnModal.jsx';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { branches, activeBranchId, setActiveBranchId } = useBranch();
  const { isBranchUser, currentUser, isAdmin } = useAuth();
  const { showToast } = useToast();

  const effectiveBranch = isBranchUser ? currentUser.assignedBranchId : activeBranchId;

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentModeFilter, setPaymentModeFilter] = useState('ALL');

  // Modals
  const [inspectingInvoice, setInspectingInvoice] = useState(null);
  const [returningInvoice, setReturningInvoice] = useState(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await posService.getInvoices({
        branchId: effectiveBranch,
        status: statusFilter,
        search: searchQuery,
      });
      setInvoices(data);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [effectiveBranch, statusFilter]);

  // Compute metrics
  const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const paidCount = invoices.filter(inv => inv.status === 'Paid').length;
  const creditOutstanding = invoices
    .filter(inv => inv.status === 'Credit')
    .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const returnedCount = invoices.filter(inv => inv.status === 'Returned').length;

  const filteredInvoices = invoices.filter(inv => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      inv.invoiceNo.toLowerCase().includes(q) ||
      inv.customerName?.toLowerCase().includes(q) ||
      inv.customerMobile?.includes(q);

    const matchesMode =
      paymentModeFilter === 'ALL' ||
      inv.payments?.some(p => p.mode.toLowerCase().includes(paymentModeFilter.toLowerCase()));

    return matchesSearch && matchesMode;
  });

  const handleExportCSV = () => {
    const rows = filteredInvoices.map(inv => ({
      Invoice_No: inv.invoiceNo,
      Date: inv.date,
      Branch: inv.branch,
      Customer_Name: inv.customerName,
      Customer_Mobile: inv.customerMobile,
      Items_Count: inv.items?.length || 0,
      Subtotal: inv.subtotal,
      GST_Total: inv.gstTotal,
      Discount: inv.discount,
      Grand_Total: inv.total,
      Payment_Mode: inv.payments?.map(p => p.mode).join(' + '),
      Status: inv.status,
      Cashier: inv.cashier,
    }));
    downloadCSV('RS_Mens_World_Sales_Invoices', rows);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Invoices & Sales Transactions
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Customer tax invoices, payment reconciliation, receipts & return processing
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
            onClick={() => navigate('/pos')}
            className="px-4 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New POS Bill</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Billed Sales
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
              <span className="font-bold text-xs">₹</span>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#102333] tracking-tight">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {effectiveBranch === 'ALL' ? 'Across all retail stores' : `${effectiveBranch} Store`}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Invoices Issued
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight">
            {invoices.length}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">{paidCount} fully paid</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Credit Outstanding
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 tracking-tight">
            {formatCurrency(creditOutstanding)}
          </div>
          <p className="text-[11px] text-amber-600 mt-1">Pending customer settlement</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Sales Returns
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-800 tracking-tight">
            {returnedCount}
          </div>
          <p className="text-[11px] text-purple-600 mt-1">Processed within 7 days</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice #, customer name or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs outline-none focus:border-[#008C83]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#f8fbfb] p-1 rounded-xl border border-slate-200">
            {['ALL', 'Paid', 'Credit', 'Returned'].map(st => (
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

          {/* Payment Mode Filter */}
          <select
            value={paymentModeFilter}
            onChange={e => setPaymentModeFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI / Online</option>
            <option value="Card">Card</option>
            <option value="Credit">Credit Ledger</option>
          </select>

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

      {/* Dense Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#f8fbfb] border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Billed</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 text-right">GST Total</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No sales invoices found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  let statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Paid
                    </span>
                  );
                  if (inv.status === 'Credit') {
                    statusBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Credit Note
                      </span>
                    );
                  } else if (inv.status === 'Returned') {
                    statusBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Returned
                      </span>
                    );
                  }

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setInspectingInvoice(inv)}
                          className="font-mono font-bold text-[#008C83] hover:underline cursor-pointer"
                        >
                          {inv.invoiceNo}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {formatDateTime(inv.date)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{inv.branch}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{inv.customerName}</div>
                        {inv.customerMobile && (
                          <div className="text-[11px] font-mono text-slate-400">{inv.customerMobile}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700">
                          {inv.items?.length || 1} items
                        </span>
                        <span className="block text-[10px] text-slate-400 truncate max-w-xs">
                          {inv.items?.map(i => i.name).join(', ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {inv.payments?.map(p => p.mode).join(' + ') || 'Cash'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {formatCurrency(inv.gstTotal || 0)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-xs">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="py-3 px-4 text-center">{statusBadge}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingInvoice(inv)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                            title="View & Print Invoice Receipt"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>

                          {inv.status !== 'Returned' && (
                            <button
                              onClick={() => setReturningInvoice(inv)}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                              title="Process Sales Return"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Return</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View & Print Receipt Modal */}
      <InvoiceReceiptModal
        invoice={inspectingInvoice}
        isOpen={Boolean(inspectingInvoice)}
        onClose={() => setInspectingInvoice(null)}
      />

      {/* Sales Return Processing Modal */}
      <SalesReturnModal
        invoice={returningInvoice}
        isOpen={Boolean(returningInvoice)}
        onClose={() => setReturningInvoice(null)}
        onReturnCompleted={loadInvoices}
      />
    </div>
  );
}
