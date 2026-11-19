import React from 'react';
import { X, Printer, CheckCircle2, Download, Store, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';
import { useBranch } from '../../context/BranchContext.jsx';

export default function InvoiceReceiptModal({ invoice, isOpen, onClose }) {
  if (!isOpen || !invoice) return null;

  const { branches } = useBranch();
  const branchObj = branches.find(b => b.id === invoice.branch);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#062b24]/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-float border border-[#D9E9E8] max-w-lg w-full overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Modal Top Control Bar (Hidden in Print) */}
        <div className="p-4 bg-[#f8fbfb] border-b border-[#D9E9E8] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-xs text-slate-800">Tax Invoice Receipt</span>
            <span className="font-mono text-xs text-slate-500">#{invoice.invoiceNo}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Paper Body */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-5 text-xs text-slate-800 font-sans print:p-0 print:m-0">
          {/* Brand Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
              RS Mens World
            </h1>
            <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
              Premium Menswear • Bespoke Suits • Royal Ethnic Gallery
            </p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {branchObj?.address || 'Main Road, Rajahmundry, AP - 533101'}
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              GSTIN: 37AAECR1024L1Z9 • Ph: {branchObj?.phone || '+91 883 244 5566'}
            </p>
          </div>

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pb-3 border-b border-dashed border-slate-300">
            <div>
              <span className="text-slate-400 block font-medium">Invoice No:</span>
              <span className="font-mono font-bold text-slate-900">{invoice.invoiceNo}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block font-medium">Date & Time:</span>
              <span className="font-mono text-slate-700">{formatDateTime(invoice.date)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Customer:</span>
              <span className="font-bold text-slate-900">{invoice.customerName || 'Walk-in Customer'}</span>
              {invoice.customerMobile && (
                <span className="font-mono text-slate-500 block">{invoice.customerMobile}</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-slate-400 block font-medium">Cashier / Staff:</span>
              <span className="text-slate-700 font-semibold">{invoice.cashier || 'Store Staff'}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <table className="w-full text-left text-[11px]">
              <thead className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.sku} • {item.colour}/{item.size} • GST {item.gstRate}%
                      </div>
                    </td>
                    <td className="py-2.5 text-center font-bold">{item.qty}</td>
                    <td className="py-2.5 text-right font-mono text-slate-600">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.qty * item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Tax Calculation Breakdown */}
          <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Taxable Subtotal:</span>
              <span className="font-mono">{formatCurrency(invoice.subtotal || invoice.total * 0.95)}</span>
            </div>

            <div className="flex justify-between text-slate-500">
              <span>CGST (Central Tax):</span>
              <span className="font-mono">{formatCurrency((invoice.gstTotal || invoice.total * 0.05) / 2)}</span>
            </div>

            <div className="flex justify-between text-slate-500">
              <span>SGST (State Tax):</span>
              <span className="font-mono">{formatCurrency((invoice.gstTotal || invoice.total * 0.05) / 2)}</span>
            </div>

            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Promotional Discount:</span>
                <span className="font-mono">- {formatCurrency(invoice.discount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-extrabold text-[#004F4C] pt-2 border-t border-dashed border-slate-300">
              <span>Grand Total Payable:</span>
              <span className="text-base font-black">{formatCurrency(invoice.total)}</span>
            </div>
          </div>

          {/* Payment Mode Receipt */}
          <div className="p-3 bg-[#f8fbfb] rounded-xl border border-slate-200/80 space-y-1 text-[11px]">
            <div className="flex justify-between items-center font-semibold text-slate-800">
              <span>Payment Mode:</span>
              <span className="text-[#008C83] font-bold">
                {invoice.payments?.map(p => `${p.mode}: ${formatCurrency(p.amount)}`).join(' • ') || 'Cash'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Status:</span>
              <span className="font-bold uppercase text-emerald-700 tracking-wide">
                ✓ {invoice.status || 'Paid'}
              </span>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="text-center pt-3 text-[10px] text-slate-400 space-y-1 leading-relaxed border-t border-dashed border-slate-300">
            <p className="font-semibold text-slate-600">Thank you for shopping at RS Mens World!</p>
            <p>Garments once sold can be exchanged within 7 days with original tag and receipt.</p>
            <p>Altered or tailored suits are strictly non-exchangeable.</p>
          </div>
        </div>

        {/* Modal Bottom Close (Hidden in Print) */}
        <div className="p-4 bg-[#f8fbfb] border-t border-[#D9E9E8] flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
