import React, { useState, useEffect } from 'react';
import { X, Package, Tag, Barcode, Shield, Plus, Save } from 'lucide-react';
import { RETAIL_CATEGORIES } from '../../mocks/retailSeedData.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function ProductModal({ isOpen, onClose, onSave, product = null }) {
  if (!isOpen) return null;

  const { showToast } = useToast();
  const isEditing = Boolean(product?.id);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Shirts',
    brand: 'RS Signature',
    sku: '',
    barcode: '',
    size: '40',
    colour: 'White',
    cost: 750,
    price: 1499,
    gst: 5,
    openingStock: 15,
    minStock: 5,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'Shirts',
        brand: product.brand || 'RS Signature',
        sku: product.sku || '',
        barcode: product.barcode || '',
        size: product.size || '40',
        colour: product.colour || 'White',
        cost: product.cost || 750,
        price: product.price || 1499,
        gst: product.gst || 5,
        openingStock: product.openingStock || 0,
        minStock: product.minStock || 5,
      });
    } else {
      // Auto-generate SKU & barcode for new product
      const rand = Math.floor(1000 + Math.random() * 9000);
      setFormData(prev => ({
        ...prev,
        sku: `RS-${prev.category.slice(0, 3).toUpperCase()}-${rand}`,
        barcode: `8901000${rand}79`,
      }));
    }
  }, [product]);

  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    onSave({
      ...formData,
      cost: Number(formData.cost),
      price: Number(formData.price),
      gst: Number(formData.gst),
      openingStock: Number(formData.openingStock),
      minStock: Number(formData.minStock),
    });
    showToast(`Product "${formData.name}" saved successfully`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#062b24]/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-float border border-[#D9E9E8] max-w-xl w-full overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#D9E9E8] bg-[#f8fbfb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {isEditing ? 'Edit Garment Product' : 'Add New Retail Product'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Master catalogue SKU, variants, cost & retail selling price
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Italian Wool Blazer Slim Fit"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Category *</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800 text-xs cursor-pointer"
              >
                {RETAIL_CATEGORIES.filter(c => c !== 'All Categories').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Brand *</label>
              <input
                type="text"
                required
                placeholder="e.g. RS Signature"
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Size Variant</label>
              <input
                type="text"
                placeholder="e.g. 39, 40, L, XL, 32"
                value={formData.size}
                onChange={e => setFormData({ ...formData, size: e.target.value })}
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Colour Variant</label>
              <input
                type="text"
                placeholder="e.g. Navy, Sky Blue, Gold"
                value={formData.colour}
                onChange={e => setFormData({ ...formData, colour: e.target.value })}
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">SKU Code</label>
              <input
                type="text"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] font-mono text-[11px] text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Barcode (EAN-13)</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] font-mono text-[11px] text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Unit Cost (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.cost}
                onChange={e => setFormData({ ...formData, cost: e.target.value })}
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800 font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Retail MRP (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-[#008C83] font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">GST Rate (%)</label>
              <select
                value={formData.gst}
                onChange={e => setFormData({ ...formData, gst: e.target.value })}
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800 cursor-pointer"
              >
                <option value={5}>5% (Apparel &lt; ₹2.5k)</option>
                <option value={12}>12% (Accessories)</option>
                <option value={18}>18% (Suits &gt; ₹2.5k)</option>
              </select>
            </div>
          </div>

          {!isEditing && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">Opening Stock / Branch</label>
                <input
                  type="number"
                  min="0"
                  value={formData.openingStock}
                  onChange={e => setFormData({ ...formData, openingStock: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">Low Stock Alert Min</label>
                <input
                  type="number"
                  min="1"
                  value={formData.minStock}
                  onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800"
                />
              </div>
            </div>
          )}

          <div className="p-4 bg-[#f8fbfb] border-t border-[#D9E9E8] flex items-center justify-end gap-2 -mx-6 -mb-6 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Update Product' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
