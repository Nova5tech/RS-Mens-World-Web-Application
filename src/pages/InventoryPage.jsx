import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Sliders,
  AlertTriangle,
  ArrowUpDown,
  History,
  Download,
  CheckCircle2,
  AlertCircle,
  Tag,
  Building,
  Edit2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { productService } from '../services/productService.js';
import { inventoryService } from '../services/inventoryService.js';
import { useBranch } from '../context/BranchContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { RETAIL_CATEGORIES } from '../mocks/retailSeedData.js';
import { formatCurrency, formatDateTime, downloadCSV } from '../utils/formatters.js';
import ProductModal from '../components/inventory/ProductModal.jsx';
import StockAdjustModal from '../components/inventory/StockAdjustModal.jsx';

export default function InventoryPage() {
  const { branches, activeBranchId, setActiveBranchId } = useBranch();
  const { isBranchUser, currentUser, isAdmin } = useAuth();
  const { showToast } = useToast();

  const effectiveBranch = isBranchUser ? currentUser.assignedBranchId : activeBranchId;

  const [activeTab, setActiveTab] = useState('catalogue'); // 'catalogue' | 'movements' | 'lowstock'
  const [products, setProducts] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [movements, setMovements] = useState([]);
  const [summary, setSummary] = useState({
    totalSkus: 0,
    totalUnits: 0,
    totalCostValue: 0,
    lowStockCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [movementTypeFilter, setMovementTypeFilter] = useState('ALL');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [adjustingProduct, setAdjustingProduct] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, stock, sum, movs] = await Promise.all([
        productService.getProducts(),
        inventoryService.getStock(effectiveBranch),
        inventoryService.getInventorySummary(effectiveBranch),
        inventoryService.getMovements({ branchId: effectiveBranch }),
      ]);
      setProducts(prods);
      setStockList(stock);
      setSummary(sum);
      setMovements(movs);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [effectiveBranch]);

  // Merge products with branch stock
  const mergedProducts = products.map(p => {
    const stockEntries = stockList.filter(s => s.productId === p.id);
    const branchStock = effectiveBranch === 'ALL'
      ? stockEntries.reduce((sum, s) => sum + (s.qty || 0), 0)
      : stockEntries.find(s => s.branch === effectiveBranch)?.qty || 0;

    const damagedCount = effectiveBranch === 'ALL'
      ? stockEntries.reduce((sum, s) => sum + (s.damaged || 0), 0)
      : stockEntries.find(s => s.branch === effectiveBranch)?.damaged || 0;

    const minLevel = stockEntries[0]?.min || 5;

    return {
      ...p,
      stockQty: branchStock,
      damagedQty: damagedCount,
      minLevel,
      isLowStock: branchStock <= minLevel,
      isOutOfStock: branchStock === 0,
    };
  });

  // Filtered catalogue
  const filteredProducts = mergedProducts.filter(p => {
    const matchesCat = selectedCategory === 'All Categories' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.brand.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const lowStockItems = mergedProducts.filter(p => p.isLowStock);

  // Handlers
  const handleSaveProduct = async productData => {
    if (editingProduct?.id) {
      await productService.updateProduct(editingProduct.id, productData);
    } else {
      await productService.createProduct(productData);
    }
    loadData();
  };

  const handleAdjustStock = async (branch, productId, delta, reason, user) => {
    await inventoryService.adjustStock(branch, productId, delta, reason, user);
    loadData();
  };

  const handleExportCSV = () => {
    const rows = filteredProducts.map(p => ({
      SKU: p.sku,
      Barcode: p.barcode,
      Name: p.name,
      Category: p.category,
      Brand: p.brand,
      Size: p.size,
      Colour: p.colour,
      Unit_Cost: p.cost,
      Retail_MRP: p.price,
      GST_Rate: `${p.gst}%`,
      Current_Stock: p.stockQty,
      Damaged: p.damagedQty,
      Branch: effectiveBranch,
    }));
    downloadCSV('RS_Mens_World_Inventory_Catalogue', rows);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Inventory & Catalogue Management
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Master garment SKUs, variant matrix, branch stock balances & movement ledger
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

          {isAdmin && (
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Active SKUs
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#102333] tracking-tight">
            {summary.totalSkus}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across 8 retail garment categories</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Stock on Hand
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight">
            {summary.totalUnits.toLocaleString()} units
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">
            {effectiveBranch === 'ALL' ? 'Total across all 4 branches' : `In ${effectiveBranch} store`}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Inventory Value (Cost)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <span className="font-bold text-xs">₹</span>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#102333] tracking-tight">
            {formatCurrency(summary.totalCostValue)}
          </div>
          <p className="text-[11px] text-blue-600 mt-1">Purchase cost valuation</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 tracking-tight">
            {summary.lowStockCount}
          </div>
          <p className="text-[11px] text-amber-600 mt-1">Require warehouse replenishment</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('catalogue')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'catalogue'
              ? 'bg-[#0f766e] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Stock & Product Catalogue ({filteredProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'movements'
              ? 'bg-[#0f766e] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Stock Movement Ledger ({movements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lowstock')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'lowstock'
              ? 'bg-[#0f766e] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Low-Stock Alerts ({lowStockItems.length})</span>
        </button>
      </div>

      {/* TAB 1: STOCK & CATALOGUE */}
      {activeTab === 'catalogue' && (
        <div className="space-y-4">
          {/* Horizontal Search & Filter Bar */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by product, SKU, barcode..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs outline-none focus:border-[#008C83]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                {RETAIL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {isAdmin && (
                <select
                  value={effectiveBranch}
                  onChange={e => setActiveBranchId(e.target.value)}
                  className="px-3 py-1.5 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">All Store Branches</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Dense Products & Stock Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#f8fbfb] border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Garment / Product</th>
                    <th className="py-3 px-4">SKU & Barcode</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Variant</th>
                    <th className="py-3 px-4 text-right">Cost Price</th>
                    <th className="py-3 px-4 text-right">Retail MRP</th>
                    <th className="py-3 px-4 text-center">GST %</th>
                    <th className="py-3 px-4 text-center">Branch Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        No products match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(p => {
                      let statusBadge = (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          In Stock ({p.stockQty})
                        </span>
                      );
                      if (p.isOutOfStock) {
                        statusBadge = (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Out of Stock
                          </span>
                        );
                      } else if (p.isLowStock) {
                        statusBadge = (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Low Stock ({p.stockQty})
                          </span>
                        );
                      }

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{p.name}</div>
                            <div className="text-[11px] text-slate-400 font-sans">{p.brand}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px]">
                            <span className="font-semibold text-slate-700 block">{p.sku}</span>
                            <span className="text-slate-400">{p.barcode}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {p.colour} • {p.size}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-medium text-slate-500">
                            {formatCurrency(p.cost)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#008C83]">
                            {formatCurrency(p.price)}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-600">
                            {p.gst}%
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-extrabold text-slate-900 text-sm">
                              {p.stockQty}
                            </span>
                            {p.damagedQty > 0 && (
                              <span className="block text-[10px] text-rose-600 font-semibold">
                                ({p.damagedQty} damaged)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">{statusBadge}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setAdjustingProduct(p)}
                                title="Adjust branch stock"
                                className="px-2.5 py-1 rounded-lg bg-[#e6f7f2] hover:bg-[#d0f2e6] text-[#008C83] font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                Adjust
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setIsProductModalOpen(true);
                                  }}
                                  title="Edit product master"
                                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* TAB 2: STOCK MOVEMENT LEDGER */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Perpetual Stock Ledger Audit (All Dispatches, Inflows & POS Sales)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Type:</span>
              <select
                value={movementTypeFilter}
                onChange={e => setMovementTypeFilter(e.target.value)}
                className="px-3 py-1 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="ALL">All Movement Types</option>
                <option value="Sale">Sale (POS)</option>
                <option value="Adjustment">Adjustment / Write-off</option>
                <option value="Transfer Out">Transfer Out</option>
                <option value="Transfer In">Transfer In</option>
                <option value="Return">Sales Return</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#f8fbfb] border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Garment Item</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4 text-center">Change (Qty)</th>
                  <th className="py-3 px-4 text-center">New Balance</th>
                  <th className="py-3 px-4">Reference / Order</th>
                  <th className="py-3 px-4">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements
                  .filter(m => movementTypeFilter === 'ALL' || m.type === movementTypeFilter)
                  .map(mov => {
                    let typeBadge = 'bg-slate-100 text-slate-700';
                    if (mov.type === 'Sale') typeBadge = 'bg-blue-50 text-blue-700 border border-blue-200';
                    else if (mov.type === 'Adjustment') typeBadge = 'bg-amber-50 text-amber-700 border border-amber-200';
                    else if (mov.type === 'Transfer Out') typeBadge = 'bg-rose-50 text-rose-700 border border-rose-200';
                    else if (mov.type === 'Transfer In') typeBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                    else if (mov.type === 'Return') typeBadge = 'bg-purple-50 text-purple-700 border border-purple-200';

                    return (
                      <tr key={mov.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          {formatDateTime(mov.date)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{mov.branch}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{mov.productName}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${typeBadge}`}>
                            {mov.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-extrabold">
                          <span className={mov.qty > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                            {mov.qty > 0 ? `+${mov.qty}` : mov.qty}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                          {mov.balance}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                          {mov.reference}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{mov.user}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LOW STOCK & REORDER ALERTS */}
      {activeTab === 'lowstock' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>
                These products have fallen to or below the branch reorder threshold. Create a stock transfer from Rajahmandary warehouse or submit an inventory purchase PO.
              </span>
            </div>
            <span className="font-bold text-amber-800 shrink-0 ml-3">
              {lowStockItems.length} SKUs Alerting
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map(item => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-mono text-xs font-bold text-slate-800">{item.sku}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Stock: {item.stockQty} / Min: {item.minLevel}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-2">{item.name}</h4>
                  <div className="text-xs text-slate-500 font-sans mt-0.5">
                    {item.brand} • {item.colour} • Size: {item.size}
                  </div>
                  <div className="flex items-center justify-between text-xs pt-3 text-slate-600">
                    <span>Retail MRP: <strong>{formatCurrency(item.price)}</strong></span>
                    <span>Cost: <strong>{formatCurrency(item.cost)}</strong></span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Branch: {effectiveBranch}</span>
                  <button
                    onClick={() => {
                      showToast(`Requisition order initiated for ${item.name}`, 'success');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#0f766e] hover:bg-[#0d655f] text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    + Reorder Requisition
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustModal
        isOpen={Boolean(adjustingProduct)}
        onClose={() => setAdjustingProduct(null)}
        product={adjustingProduct}
        currentQty={adjustingProduct?.stockQty || 0}
        onAdjust={handleAdjustStock}
      />
    </div>
  );
}
