import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Calendar,
  CreditCard,
  Banknote,
  TrendingUp,
  TrendingDown,
  Calculator,
  Download,
  AlertCircle,
  CheckCircle2,
  Users,
  Store,
  Layers,
} from 'lucide-react';
import { accountingService } from '../services/accountingService.js';
import { posService } from '../services/posService.js';
import { useBranch } from '../context/BranchContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatCurrency, formatDateTime, downloadCSV } from '../utils/formatters.js';
import NewLedgerEntryModal from '../components/accounting/NewLedgerEntryModal.jsx';
import DayEndClosingModal from '../components/accounting/DayEndClosingModal.jsx';

export default function AccountingPage() {
  const { branches, activeBranchId, setActiveBranchId } = useBranch();
  const { isBranchUser, currentUser, isAdmin } = useAuth();
  const { showToast } = useToast();

  const effectiveBranch = isBranchUser ? currentUser.assignedBranchId : activeBranchId;

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ledger' | 'outstanding' | 'closing'
  const [ledger, setLedger] = useState([]);
  const [closings, setClosings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    customerOutstanding: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [led, sum, cls, invs] = await Promise.all([
        accountingService.getLedger({ branchId: effectiveBranch }),
        accountingService.getFinancialSummary(effectiveBranch),
        accountingService.getClosings(effectiveBranch),
        posService.getInvoices({ branchId: effectiveBranch }),
      ]);
      setLedger(led);
      setSummary(sum);
      setClosings(cls);
      setInvoices(invs);
    } catch (err) {
      console.error('Failed to load accounting data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [effectiveBranch]);

  // Credit Invoices for Customer Outstanding tab
  const creditInvoices = invoices.filter(inv => inv.status === 'Credit');

  const filteredLedger = ledger.filter(l => {
    const matchesType = typeFilter === 'ALL' || l.type === typeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      l.category.toLowerCase().includes(q) ||
      l.reference.toLowerCase().includes(q) ||
      l.notes?.toLowerCase().includes(q) ||
      l.mode.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const handleExportCSV = () => {
    const rows = filteredLedger.map(l => ({
      Entry_ID: l.id,
      Date: l.date,
      Branch: l.branch,
      Type: l.type,
      Category: l.category,
      Amount: l.amount,
      Payment_Mode: l.mode,
      Reference: l.reference,
      Notes: l.notes || '',
    }));
    downloadCSV('RS_Mens_World_General_Ledger', rows);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Financial Ledger & Store Accounting
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Cash & digital receipts, expense entries, customer credit balances & day-end register closing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Ledger</span>
          </button>

          <button
            onClick={() => setIsClosingModalOpen(true)}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-slate-500" />
            <span>Day-End Closing</span>
          </button>

          <button
            onClick={() => setIsEntryModalOpen(true)}
            className="px-4 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue (Inflow)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight">
            {formatCurrency(summary.totalIncome)}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">POS sales & customer collections</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Operating Expenses
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-700">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-700 tracking-tight">
            {formatCurrency(summary.totalExpense)}
          </div>
          <p className="text-[11px] text-rose-600 mt-1">Petty cash, utilities & store maintenance</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Net Operating Margin
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
              <span className="font-bold text-xs">₹</span>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#004F4C] tracking-tight">
            {formatCurrency(summary.netProfit)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Inflow minus store operating costs</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Customer Credit Due
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 tracking-tight">
            {formatCurrency(summary.customerOutstanding)}
          </div>
          <p className="text-[11px] text-amber-600 mt-1">Pending customer settlement</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#0f766e] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Financial Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-[#0f766e] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>General Ledger ({ledger.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('outstanding')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'outstanding'
              ? 'bg-[#0f766e] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Customer Credit Due ({creditInvoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('closing')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'closing'
              ? 'bg-[#0f766e] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Day-End Register Closings ({closings.length})</span>
        </button>
      </div>

      {/* TAB 1: FINANCIAL OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Revenue Inflow Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-800">Inflow & Sales Distribution</span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  {formatCurrency(summary.totalIncome)}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Store POS Cash Collections:</span>
                  <span className="font-mono font-bold text-slate-900">₹24,949</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Digital UPI & QR Payments:</span>
                  <span className="font-mono font-bold text-slate-900">₹40,800</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Credit Card Counter Swipes:</span>
                  <span className="font-mono font-bold text-slate-900">₹32,500</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Custom Tailoring Charges:</span>
                  <span className="font-mono font-bold text-slate-900">₹6,800</span>
                </div>
              </div>
            </div>

            {/* Operating Expense Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-800">Operating Expense Distribution</span>
                <span className="font-extrabold text-rose-700 text-sm">
                  {formatCurrency(summary.totalExpense)}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Store Utilities (Electricity, Water):</span>
                  <span className="font-mono font-bold text-slate-900">₹1,450</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Packaging & Garment Suit Bags:</span>
                  <span className="font-mono font-bold text-slate-900">₹2,800</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Staff Refreshments & Tea:</span>
                  <span className="font-mono font-bold text-slate-900">₹850</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Local Express Alteration Courier:</span>
                  <span className="font-mono font-bold text-slate-900">₹400</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GENERAL LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search category, reference or payment mode..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs outline-none focus:border-[#008C83]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="ALL">All Entries (In & Out)</option>
                <option value="Income">Income / Receipts Only</option>
                <option value="Expense">Expenses Only</option>
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

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#f8fbfb] border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLedger.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {formatDateTime(l.date)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{l.branch}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          l.type === 'Income'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {l.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{l.category}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px]">
                        {l.mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{l.reference}</td>
                    <td
                      className={`py-3.5 px-4 text-right font-mono font-black text-xs ${
                        l.type === 'Income' ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {l.type === 'Income' ? `+${formatCurrency(l.amount)}` : `-${formatCurrency(l.amount)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER CREDIT OUTSTANDING */}
      {activeTab === 'outstanding' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>
                These customer sales invoices were billed on credit ledger. Follow up via WhatsApp or collect in-store payment upon garment delivery.
              </span>
            </div>
            <span className="font-bold text-amber-800 shrink-0 ml-3">
              Total Outstanding: {formatCurrency(summary.customerOutstanding)}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#f8fbfb] border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Billed Date</th>
                  <th className="py-3 px-4 text-right">Credit Amount Due</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {creditInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No customer credit balances outstanding.
                    </td>
                  </tr>
                ) : (
                  creditInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#008C83]">
                        {inv.invoiceNo}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{inv.customerName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{inv.customerMobile}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{inv.branch}</td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDateTime(inv.date)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-amber-700 text-xs">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            showToast(`Payment collected for Invoice ${inv.invoiceNo}`, 'success');
                            loadData();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Collect Payment
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DAY-END REGISTER CLOSINGS */}
      {activeTab === 'closing' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-[#f0f9f7] rounded-2xl border border-[#D9E9E8] flex items-center justify-between text-xs text-slate-700">
            <span>
              End-of-day store register reconciliations recorded across branches. Physical cash drawer counts are audited against terminal POS invoices.
            </span>
            <button
              onClick={() => setIsClosingModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
            >
              + Close Today's Register
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#f8fbfb] border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Closing Date</th>
                  <th className="py-3 px-4">Store Branch</th>
                  <th className="py-3 px-4 text-right">Opening Cash</th>
                  <th className="py-3 px-4 text-right">Cash Sales</th>
                  <th className="py-3 px-4 text-right">Expenses Paid</th>
                  <th className="py-3 px-4 text-right">Expected Cash</th>
                  <th className="py-3 px-4 text-right">Counted Cash</th>
                  <th className="py-3 px-4 text-center">Variance</th>
                  <th className="py-3 px-4">Closed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {closings.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{c.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{c.branch}</td>
                    <td className="py-3.5 px-4 text-right font-mono">{formatCurrency(c.openingCash)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-semibold">
                      +{formatCurrency(c.cashSales)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-rose-600">
                      -{formatCurrency(c.expenses)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold">
                      {formatCurrency(c.expectedCash)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(c.closingCash)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.variance === 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {c.variance === 0 ? 'Balanced (₹0)' : formatCurrency(c.variance)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{c.closedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Transaction Modal */}
      <NewLedgerEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onEntryAdded={loadData}
      />

      {/* Day-End Closing Modal */}
      <DayEndClosingModal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
        onClosingRecorded={loadData}
      />
    </div>
  );
}
