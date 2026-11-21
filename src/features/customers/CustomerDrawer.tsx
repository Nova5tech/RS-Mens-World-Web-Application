import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Store,
  Tag,
  Calendar,
  ShoppingCart,
  Send,
  MessageSquare,
  Edit2,
  Trash2,
  UserX,
} from 'lucide-react';
import { Customer } from '@/types/models';
import { Pill } from '@/components/ui/Pill';
import { Button } from '@/components/ui/Button';
import { formatPhone } from '@/lib/phone';
import { formatCurrency, formatDate } from '@/lib/format';
import { markCustomerOptedOut, deleteCustomer } from '@/services/customers';

export interface CustomerDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onRefresh: () => void;
}

export const CustomerDrawer: React.FC<CustomerDrawerProps> = ({
  customer,
  isOpen,
  onClose,
  onEdit,
  onRefresh,
}) => {
  const [isOptingOut, setIsOptingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !customer) return null;

  const handleMarkOptedOut = async () => {
    if (confirm(`Mark customer ${customer.name} as opted-out of marketing?`)) {
      setIsOptingOut(true);
      try {
        await markCustomerOptedOut(customer.id);
        onRefresh();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Failed to update consent status');
      } finally {
        setIsOptingOut(false);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete customer ${customer.name}? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await deleteCustomer(customer.id);
        onRefresh();
        onClose();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Failed to delete customer');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <div className="bg-white shadow-2xl flex flex-col h-full w-full sm:w-[480px] border-l border-border-card animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border-card bg-[#F8FAFA]">
            <div>
              <h2 className="text-lg font-bold text-app-text tracking-tight">Customer Details</h2>
              <p className="text-xs text-app-muted mt-0.5 font-mono">{customer.code}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Profile Overview Card */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-border-card">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-accent-soft text-primary-brand font-bold text-base flex items-center justify-center">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-app-text leading-tight">{customer.name}</h3>
                  <div className="text-xs text-app-muted mt-1 font-mono">
                    Customer ID: <strong className="text-slate-700">{customer.code}</strong>
                  </div>
                </div>
              </div>

              <div>
                {customer.status === 'active' && <Pill variant="green" dot>Active</Pill>}
                {customer.status === 'new' && <Pill variant="blue" dot>New</Pill>}
                {customer.status === 'inactive' && <Pill variant="red" dot>Inactive</Pill>}
              </div>
            </div>

            {/* Core Info List */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-mono font-medium text-sm">{formatPhone(customer.phone)}</span>
              </div>

              {customer.email && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{customer.email}</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-slate-700">
                <Store className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-medium">{customer.branch_name || 'Main Branch'}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{customer.customer_type} Customer</span>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Customer since {formatDate(customer.created_at)}</span>
              </div>
            </div>

            {/* Purchase Summary Card (matches screenshot) */}
            <div className="p-4 rounded-2xl bg-[#E6F7EF] border border-[#C6EED9]">
              <div className="flex items-center gap-2 text-primary-brand font-bold text-sm mb-3">
                <ShoppingCart className="w-4 h-4" />
                <span>Purchase Summary</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-left">
                <div>
                  <span className="text-[11px] text-slate-600 font-medium block">Total Purchases</span>
                  <span className="text-base font-extrabold text-primary-brand mt-0.5 block">
                    {formatCurrency(customer.total_purchases)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-600 font-medium block">No. of Orders</span>
                  <span className="text-base font-extrabold text-primary-brand mt-0.5 block">
                    {customer.order_count}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-600 font-medium block">Avg. Order Value</span>
                  <span className="text-base font-extrabold text-primary-brand mt-0.5 block">
                    {formatCurrency(
                      customer.order_count > 0
                        ? Math.round(customer.total_purchases / customer.order_count)
                        : 0
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Marketing Consent Section */}
            <div className="p-4 rounded-2xl bg-white border border-border-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-app-text uppercase tracking-wider">
                  Marketing Consent
                </span>
                {customer.consent ? (
                  <Pill variant="green" dot>✓ Consented</Pill>
                ) : (
                  <Pill variant="red" dot>✕ Opted Out</Pill>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-app-muted">Consent Source:</span>
                  <span className="font-medium font-mono text-slate-800">
                    {customer.consent_source || 'manual'}
                  </span>
                </div>
                {customer.consent_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-app-muted">Consented On:</span>
                    <span className="font-medium text-slate-800">
                      {formatDate(customer.consent_at)}
                    </span>
                  </div>
                )}
                {customer.opted_out_at && (
                  <div className="flex items-center justify-between text-red-600">
                    <span>Opted Out On:</span>
                    <span className="font-medium">{formatDate(customer.opted_out_at)}</span>
                  </div>
                )}
              </div>

              {customer.consent && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    disabled={isOptingOut}
                    onClick={handleMarkOptedOut}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Mark as Opted-Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Recent Activity Timeline */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-app-text uppercase tracking-wider block">
                Recent Touchpoints &amp; Campaigns
              </span>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-border-card flex items-start gap-2.5 text-xs">
                  <Send className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-app-text">WhatsApp Campaign: Festive Offer Flat 20%</div>
                    <div className="text-[11px] text-app-muted mt-0.5">Delivered &amp; Read • {formatDate(customer.last_interaction_at)}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-border-card flex items-start gap-2.5 text-xs">
                  <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-app-text">Store Visit &amp; Billing Interaction</div>
                    <div className="text-[11px] text-app-muted mt-0.5">Recorded at {customer.branch_name || 'Main Branch'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-4 border-t border-border-card bg-slate-50/80 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:bg-red-50 border-red-200 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onEdit(customer)}
                className="bg-primary-brand gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Customer</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
