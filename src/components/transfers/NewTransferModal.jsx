import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Plus, Trash2, Check, AlertCircle, Store } from 'lucide-react';
import { transferService } from '../../services/transferService.js';
import { productService } from '../../services/productService.js';
import { inventoryService } from '../../services/inventoryService.js';
import { useBranch } from '../../context/BranchContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function NewTransferModal({ isOpen, onClose, onTransferCreated }) {
  if (!isOpen) return null;

  const { branches } = useBranch();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [fromBranch, setFromBranch] = useState('B1');
  const [toBranch, setToBranch] = useState('B2');
  const [products, setProducts] = useState([]);
  const [stockMap, setStockMap] = useState({});

  // Transfer Items
  const [selectedItems, setSelectedItems] = useState([
    { productId: '', qty: 1 },
  ]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchCatalogue() {
      const prods = await productService.getProducts();
      setProducts(prods);
      const stock = await inventoryService.getStock(fromBranch);
      const map = {};
      stock.forEach(s => {
        map[s.productId] = s.qty || 0;
      });
      setStockMap(map);
      if (prods.length > 0 && selectedItems[0]?.productId === '') {
        setSelectedItems([{ productId: prods[0].id, qty: 1 }]);
      }
    }
    fetchCatalogue();
  }, [fromBranch]);

  const handleAddItemRow = () => {
    setSelectedItems([...selectedItems, { productId: products[0]?.id || '', qty: 1 }]);
  };

  const handleRemoveRow = index => {
    if (selectedItems.length === 1) return;
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...selectedItems];
    updated[index][field] = value;
    setSelectedItems(updated);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (fromBranch === toBranch) {
      showToast('Source and destination branches cannot be the same', 'error');
      return;
    }

    const itemsToTransfer = selectedItems.map(item => {
      const p = products.find(prod => prod.id === item.productId);
      return {
        productId: item.productId,
        name: p?.name || 'Garment Item',
        sku: p?.sku || '',
        qty: Number(item.qty),
        receivedQty: 0,
      };
    });

    // Validate quantities against source stock
    for (const itm of itemsToTransfer) {
      const available = stockMap[itm.productId] || 0;
      if (itm.qty > available) {
        showToast(`Cannot transfer ${itm.qty} of ${itm.name}. Only ${available} available at source branch.`, 'error');
        return;
      }
    }

    try {
      setSubmitting(true);
      await transferService.createTransfer({
        from: fromBranch,
        to: toBranch,
        items: itemsToTransfer,
        requestedBy: currentUser?.name || 'Store Staff',
        notes,
      });

      showToast(`Stock transfer requisition created from ${fromBranch} to ${toBranch}`, 'success');
      onTransferCreated?.();
      onClose();
    } catch (err) {
      showToast('Failed to create transfer: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#062b24]/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-float border border-[#D9E9E8] max-w-xl w-full overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#D9E9E8] bg-[#f8fbfb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Create Stock Transfer</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inter-branch garment requisition & dispatch tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          {/* Source and Destination Branch Pickers */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#f8fbfb] rounded-2xl border border-slate-200/80">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Source Branch (From) *</label>
              <select
                value={fromBranch}
                onChange={e => setFromBranch(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Destination Branch (To) *</label>
              <select
                value={toBranch}
                onChange={e => setToBranch(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              >
                {branches.filter(b => b.id !== fromBranch).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Transfer Items Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 block">Requisition Items *</label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-[11px] font-bold text-[#008C83] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {selectedItems.map((item, idx) => {
                const availableStock = stockMap[item.productId] || 0;
                return (
                  <div
                    key={idx}
                    className="p-3 bg-[#f8fbfb] border border-slate-200 rounded-xl flex items-center gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <select
                        value={item.productId}
                        onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.colour}/{p.size}) — {stockMap[p.id] || 0} in stock
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        max={availableStock || 99}
                        value={item.qty}
                        onChange={e => handleItemChange(idx, 'qty', Math.max(1, Number(e.target.value)))}
                        className="w-full p-1.5 text-center bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={selectedItems.length === 1}
                      onClick={() => handleRemoveRow(idx)}
                      className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transfer Reason / Notes */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Requisition Purpose / Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Replenishment for festive groom consultation showcase"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800 text-xs"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:bg-slate-300"
            >
              <Check className="w-4 h-4" />
              <span>Submit Requisition</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
