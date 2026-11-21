import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Customer, Branch, CustomerType } from '@/types/models';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { normalizePhone } from '@/lib/phone';
import { createCustomer, updateCustomer } from '@/services/customers';
import { cn } from '@/lib/utils';

export interface AddEditCustomerDrawerProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSuccess: () => void;
  branches: Branch[];
  currentBranchId?: string | null;
  isBranchUser?: boolean;
}

export const AddEditCustomerDrawer: React.FC<AddEditCustomerDrawerProps> = ({
  isOpen,
  customer,
  onClose,
  onSuccess,
  branches,
  currentBranchId,
  isBranchUser,
}) => {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    branch_id: '',
    birthday: '',
    anniversary: '',
    customer_type: 'Regular' as CustomerType,
    consent: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name,
        mobile: customer.phone.replace('+91', ''),
        email: customer.email || '',
        branch_id: customer.branch_id,
        birthday: customer.birthday || '',
        anniversary: customer.anniversary || '',
        customer_type: customer.customer_type,
        consent: customer.consent,
      });
    } else {
      setForm({
        name: '',
        mobile: '',
        email: '',
        branch_id: currentBranchId || branches[0]?.id || '',
        birthday: '',
        anniversary: '',
        customer_type: 'Regular',
        consent: true,
      });
    }
    setErrors({});
  }, [customer, isOpen, currentBranchId, branches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = 'Customer name is required';

    const norm = normalizePhone(form.mobile);
    if (!norm.isValid) {
      newErrors.mobile = norm.error || 'Enter a valid 10-digit mobile number';
    }

    if (!form.branch_id) {
      newErrors.branch_id = 'Please select a branch';
    }

    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (customer) {
        await updateCustomer(customer.id, {
          name: form.name.trim(),
          phone: norm.e164,
          email: form.email.trim() || undefined,
          branch_id: form.branch_id,
          birthday: form.birthday || undefined,
          anniversary: form.anniversary || undefined,
          customer_type: form.customer_type,
          consent: form.consent,
          consent_source: form.consent ? (customer.consent_source || 'manual') : undefined,
          opted_out_at: !form.consent ? new Date().toISOString() : null,
        });
      } else {
        await createCustomer({
          name: form.name.trim(),
          phone: norm.e164,
          email: form.email.trim() || undefined,
          branch_id: form.branch_id,
          birthday: form.birthday || undefined,
          anniversary: form.anniversary || undefined,
          customer_type: form.customer_type,
          consent: form.consent,
          status: 'new',
          source: 'Manual Form',
          consent_source: 'manual',
          opted_out_at: !form.consent ? new Date().toISOString() : null,
        });
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to save customer' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'Edit Customer' : 'Add New Customer'}
      subtitle="Enter profile and contact details to register customer"
      width="w-full sm:w-[460px]"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary-brand"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            <span>{customer ? 'Update Customer' : 'Save Customer'}</span>
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
            {errors.form}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-app-text mb-1.5">
            Customer Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Rahul Kumar"
            className="w-full h-10 px-3 text-sm bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
          />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-app-text mb-1.5">
            Mobile Number (+91) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
              +91
            </span>
            <input
              type="text"
              maxLength={10}
              value={form.mobile}
              onChange={(e) =>
                setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })
              }
              placeholder="9876543210"
              className="w-full h-10 pl-11 pr-3 text-sm bg-white border border-border-card rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-accent-brand"
            />
          </div>
          {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-app-text mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="customer@example.com"
            className="w-full h-10 px-3 text-sm bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-app-text mb-1.5">
            Store Branch *
          </label>
          <select
            disabled={isBranchUser}
            value={form.branch_id}
            onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
            className="w-full h-10 px-3 text-sm bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} – {b.name}
              </option>
            ))}
          </select>
          {errors.branch_id && (
            <p className="text-xs text-red-600 mt-1">{errors.branch_id}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-app-text mb-1.5">
            Customer Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Regular', 'VIP', 'Repeat'] as CustomerType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm({ ...form, customer_type: type })}
                className={cn(
                  'h-9 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                  form.customer_type === type
                    ? 'border-primary-brand bg-primary-brand/5 text-primary-brand ring-1 ring-primary-brand'
                    : 'border-border-card bg-white text-slate-700 hover:bg-slate-50'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-app-text mb-1.5">
              Birthday
            </label>
            <input
              type="date"
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-text mb-1.5">
              Anniversary
            </label>
            <input
              type="date"
              value={form.anniversary}
              onChange={(e) => setForm({ ...form, anniversary: e.target.value })}
              className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-border-card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-app-text block">
              WhatsApp Marketing Consent
            </span>
            <span className="text-[11px] text-app-muted">
              Records consent source as manual entry
            </span>
          </div>
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            className="w-4 h-4 text-primary-brand rounded border-slate-300 focus:ring-accent-brand"
          />
        </div>
      </form>
    </Drawer>
  );
};
