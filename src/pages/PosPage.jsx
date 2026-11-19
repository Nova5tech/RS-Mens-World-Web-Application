import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  CheckCircle2,
  UserCheck,
  Tag,
  Store,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { productService } from '../services/productService.js';
import { inventoryService } from '../services/inventoryService.js';
import { posService } from '../services/posService.js';
import { customerService } from '../services/customerService.js';
import { useBranch } from '../context/BranchContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { RETAIL_CATEGORIES } from '../mocks/retailSeedData.js';
import { formatCurrency } from '../utils/formatters.js';
import InvoiceReceiptModal from '../components/pos/InvoiceReceiptModal.jsx';

export default function PosPage() {
  const { branches, activeBranchId } = useBranch();
  const { isBranchUser, currentUser } = useAuth();
  const { showToast } = useToast();

  const effectiveBranch = isBranchUser ? currentUser.assignedBranchId : (activeBranchId !== 'ALL' ? activeBranchId : 'B1');
  const branchObj = branches.find(b => b.id === effectiveBranch);

  const [products, setProducts] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Cart State
  const [cart, setCart] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'Cash' | 'UPI' | 'Card' | 'Credit' | 'Split'
  const [splitCash, setSplitCash] = useState(0);
  const [splitOnline, setSplitOnline] = useState(0);
  const [tenderedCash, setTenderedCash] = useState('');
  const [heldBills, setHeldBills] = useState([]);

  // Completed Invoice Modal
  const [completedInvoice, setCompletedInvoice] = useState(null);

  const loadData = async () => {
    try {
      const [prods, stock, custs] = await Promise.all([
        productService.getProducts(),
        inventoryService.getStock(effectiveBranch),
        customerService.getCustomers({ branchId: effectiveBranch }),
      ]);
      setProducts(prods);
      const map = {};
      stock.forEach(s => {
        map[s.productId] = s.qty || 0;
      });
      setStockMap(map);
      setCustomers(custs);
    } catch (err) {
      console.error('Failed to load POS data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [effectiveBranch]);

  // Handle Barcode Scanner Input
  const handleBarcodeSubmit = e => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const found = products.find(
      p => p.barcode === barcodeInput.trim() || p.sku.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (found) {
      addToCart(found);
      setBarcodeInput('');
    } else {
      showToast(`No product found with barcode/SKU: ${barcodeInput}`, 'error');
    }
  };

  // Add Item to Cart
  const addToCart = product => {
    const currentStock = stockMap[product.id] || 0;
    const existingIndex = cart.findIndex(item => item.productId === product.id);

    if (existingIndex !== -1) {
      const currentCartQty = cart[existingIndex].qty;
      if (currentCartQty + 1 > currentStock) {
        showToast(`Cannot add more. Only ${currentStock} units in stock.`, 'warning');
        return;
      }
      const updated = [...cart];
      updated[existingIndex].qty += 1;
      setCart(updated);
    } else {
      if (currentStock <= 0) {
        showToast(`"${product.name}" is out of stock in this branch.`, 'error');
        return;
      }
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          brand: product.brand,
          size: product.size,
          colour: product.colour,
          price: product.price,
          cost: product.cost,
          gstRate: product.gst,
          qty: 1,
        },
      ]);
    }
  };

  const updateCartQty = (productId, delta) => {
    const updated = cart
      .map(item => {
        if (item.productId === productId) {
          const maxStock = stockMap[productId] || 99;
          const newQty = item.qty + delta;
          if (newQty > maxStock) {
            showToast(`Max available stock is ${maxStock}`, 'warning');
            return item;
          }
          return { ...item, qty: newQty };
        }
        return item;
      })
      .filter(item => item.qty > 0);

    setCart(updated);
  };

  const removeFromCart = productId => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setTenderedCash('');
  };

  // Calculations
  const grossTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalGst = cart.reduce((sum, item) => {
    const itemTotal = item.price * item.qty;
    const gstRate = item.gstRate || 5;
    const tax = itemTotal - itemTotal / (1 + gstRate / 100);
    return sum + tax;
  }, 0);
  const subtotal = Math.max(0, grossTotal - totalGst);
  const netPayable = Math.max(0, grossTotal - Number(discountAmount || 0));

  // Change Due
  const changeDue = tenderedCash ? Math.max(0, Number(tenderedCash) - netPayable) : 0;

  // Hold / Resume Bill
  const handleHoldBill = () => {
    if (cart.length === 0) return;
    setHeldBills([
      ...heldBills,
      {
        id: `hold_${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cart,
        customerId: selectedCustomerId,
        discountAmount,
      },
    ]);
    clearCart();
    showToast('Bill held successfully', 'info');
  };

  const handleResumeBill = held => {
    setCart(held.cart);
    setSelectedCustomerId(held.customerId);
    setDiscountAmount(held.discountAmount);
    setHeldBills(heldBills.filter(h => h.id !== held.id));
    showToast('Held bill restored to cart', 'success');
  };

  // Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast('Shopping cart is empty', 'error');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);

    let payments = [];
    if (paymentMode === 'Split') {
      payments = [
        { mode: 'Cash', amount: Number(splitCash) },
        { mode: 'UPI / Online', amount: Number(splitOnline) },
      ];
    } else {
      payments = [{ mode: paymentMode, amount: netPayable }];
    }

    try {
      const invoiceData = {
        branch: effectiveBranch,
        customerId: customer?.id || null,
        customerName: customer?.name || 'Walk-in Customer',
        customerMobile: customer?.mobile || '',
        items: cart.map(item => {
          const itemTotal = item.price * item.qty;
          const gstAmount = itemTotal - itemTotal / (1 + (item.gstRate || 5) / 100);
          return {
            ...item,
            gstAmount: Number(gstAmount.toFixed(2)),
            total: itemTotal,
          };
        }),
        subtotal: Number(subtotal.toFixed(2)),
        gstTotal: Number(totalGst.toFixed(2)),
        discount: Number(discountAmount || 0),
        total: netPayable,
        payments,
        cashier: currentUser?.name || 'Store Staff',
      };

      const created = await posService.checkoutSale(invoiceData);
      setCompletedInvoice(created);
      clearCart();
      loadData(); // Re-fetch updated branch inventory
      showToast(`Sale completed! Invoice #${created.invoiceNo} issued`, 'success');
    } catch (err) {
      showToast('Checkout failed: ' + err.message, 'error');
    }
  };

  // Filtered Products for catalogue grid
  const filteredProducts = products.filter(p => {
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

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Top POS Status Bar */}
      <div className="p-3 bg-[#062b24] text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#48d597]/20 flex items-center justify-center text-[#48d597]">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs flex items-center gap-2">
              <span>{branchObj?.name || 'Store Terminal'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#48d597]/20 text-[#48d597] font-mono">
                POS Online
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans">
              Cashier: {currentUser?.name || 'Store Staff'} • GST Invoice Counter
            </p>
          </div>
        </div>

        {/* Held Bills Quick Selector */}
        {heldBills.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a7f3d0] font-semibold">Held Bills ({heldBills.length}):</span>
            {heldBills.map(h => (
              <button
                key={h.id}
                onClick={() => handleResumeBill(h)}
                className="px-2.5 py-1 rounded-lg bg-[#0a3830] hover:bg-[#165045] text-white border border-[#217364] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <PlayCircle className="w-3.5 h-3.5 text-[#48d597]" />
                <span>Resume ({h.time})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main POS Layout Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Product Catalog & Search (~65% width) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Barcode & Search Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Barcode Fast Scan */}
              <form onSubmit={handleBarcodeSubmit} className="relative">
                <Barcode className="w-4 h-4 text-[#008C83] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Scan barcode or press enter..."
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs outline-none focus:border-[#008C83] font-mono"
                />
              </form>

              {/* Text Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search garment name, SKU..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs outline-none focus:border-[#008C83]"
                />
              </div>
            </div>

            {/* Category Pills Slider */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
              {RETAIL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#0f766e] text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map(p => {
              const currentStock = stockMap[p.id] || 0;
              const isOut = currentStock === 0;

              return (
                <div
                  key={p.id}
                  onClick={() => !isOut && addToCart(p)}
                  className={`bg-white p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isOut
                      ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                      : 'border-slate-200/90 shadow-2xs hover:border-[#008C83] hover:shadow-xs cursor-pointer group'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-1.5 text-[10px] font-mono text-slate-400">
                      <span>{p.category}</span>
                      <span className={currentStock > 5 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                        {currentStock} in store
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs leading-snug group-hover:text-[#008C83] transition-colors">
                      {p.name}
                    </h4>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-sans mt-1">
                      <span>{p.colour}</span>
                      <span>•</span>
                      <span>Size: {p.size}</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-extrabold text-[#008C83] text-sm">
                      {formatCurrency(p.price)}
                    </span>
                    <button
                      disabled={isOut}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                        isOut
                          ? 'bg-slate-200 text-slate-400'
                          : 'bg-[#e6f7f2] group-hover:bg-[#0f766e] text-[#008C83] group-hover:text-white'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Cart & Billing Terminal (~35% width) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-float p-5 space-y-4 sticky top-4">
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#008C83]" />
              <h3 className="font-bold text-slate-900 text-sm">Current Bill Cart</h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#e6f7f2] text-[#008C83]">
                {cart.reduce((s, i) => s + i.qty, 0)} items
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                title="Clear Cart"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Customer Selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Customer Details
            </label>
            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="w-full p-2 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="">Walk-in Customer (General Billing)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.mobile || c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Cart Line Items List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No items in bill. Scan barcode or tap garments on the left.
              </div>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {item.colour}/{item.size} • {formatCurrency(item.price)}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-[#f8fbfb] p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => updateCartQty(item.productId, -1)}
                      className="w-5 h-5 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-slate-900">{item.qty}</span>
                    <button
                      onClick={() => updateCartQty(item.productId, 1)}
                      className="w-5 h-5 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right font-bold text-slate-900 w-16 shrink-0">
                    {formatCurrency(item.qty * item.price)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing & GST Calculation Breakdown */}
          <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Gross Subtotal:</span>
              <span className="font-mono">{formatCurrency(grossTotal)}</span>
            </div>

            <div className="flex justify-between text-slate-500">
              <span>GST Included (CGST + SGST):</span>
              <span className="font-mono">{formatCurrency(totalGst)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600 pt-1">
              <span>Promo Discount (₹):</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={discountAmount}
                onChange={e => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                className="w-24 p-1 text-right bg-[#f8fbfb] border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-[#008C83]"
              />
            </div>

            <div className="flex justify-between items-center text-base font-black text-[#004F4C] pt-2 border-t border-dashed border-slate-300">
              <span>Net Payable:</span>
              <span className="text-xl font-black">{formatCurrency(netPayable)}</span>
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
              {['UPI', 'Cash', 'Card', 'Credit'].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    paymentMode === mode
                      ? 'bg-[#004F4C] text-[#A8F0D0] shadow-xs'
                      : 'bg-[#f8fbfb] border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {mode === 'UPI' && <Smartphone className="w-3.5 h-3.5" />}
                  {mode === 'Cash' && <Banknote className="w-3.5 h-3.5" />}
                  {mode === 'Card' && <CreditCard className="w-3.5 h-3.5" />}
                  {mode === 'Credit' && <Tag className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{mode}</span>
                </button>
              ))}
            </div>

            {/* Split Option */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPaymentMode('Split')}
                className={`text-[11px] font-semibold underline cursor-pointer ${
                  paymentMode === 'Split' ? 'text-[#008C83] font-bold' : 'text-slate-500'
                }`}
              >
                + Split Payment (Cash + Online)
              </button>
            </div>

            {paymentMode === 'Split' && (
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#f8fbfb] rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Cash (₹)</span>
                  <input
                    type="number"
                    min="0"
                    value={splitCash}
                    onChange={e => setSplitCash(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Online/Card (₹)</span>
                  <input
                    type="number"
                    min="0"
                    value={splitOnline}
                    onChange={e => setSplitOnline(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}

            {paymentMode === 'Cash' && (
              <div className="flex items-center justify-between p-2.5 bg-[#f8fbfb] rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Tendered Cash (₹)</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2000"
                    value={tenderedCash}
                    onChange={e => setTenderedCash(e.target.value)}
                    className="w-24 p-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">Change Return</span>
                  <span className="font-extrabold text-emerald-700 text-sm">{formatCurrency(changeDue)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions: Hold & Complete Checkout */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3.5 bg-[#008C83] hover:bg-[#00736c] active:bg-[#004F4C] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-bold text-xs tracking-wide shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#A8F0D0]" />
              <span>Complete Sale & Print Invoice</span>
            </button>

            <button
              type="button"
              onClick={handleHoldBill}
              disabled={cart.length === 0}
              className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <PauseCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Hold Current Bill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tax Invoice Print Preview Modal */}
      <InvoiceReceiptModal
        invoice={completedInvoice}
        isOpen={Boolean(completedInvoice)}
        onClose={() => setCompletedInvoice(null)}
      />
    </div>
  );
}
