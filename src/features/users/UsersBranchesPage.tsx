import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Users,
  Plus,
  Store,
  Phone,
  Clock,
  KeyRound,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  Search,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { Branch, User } from '@/types/models';
import {
  getBranches,
  createBranch,
  updateBranch,
} from '@/services/branches';
import {
  getUsers,
  createUser,
  updateUser,
  resetCredential,
} from '@/services/users';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Drawer } from '@/components/ui/Drawer';
import { Toggle } from '@/components/ui/Toggle';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export const UsersBranchesPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  // Active top-level tab: 'branches' | 'users'
  const [activeTab, setActiveTab] = useState<'branches' | 'users'>('branches');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Data states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drawer states
  const [branchDrawerOpen, setBranchDrawerOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Dialog states
  const [confirmDeactivate, setConfirmDeactivate] = useState<{
    type: 'branch' | 'user';
    id: string;
    name: string;
  } | null>(null);

  const [resetModalData, setResetModalData] = useState<{
    userName: string;
    newCredential: string;
    type: 'password' | 'pin';
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Form states - Branch
  const [branchForm, setBranchForm] = useState({
    code: '',
    name: '',
    city: '',
    address: '',
    phone: '',
    timings: '10:00 AM - 9:30 PM',
    wa_phone_id: '',
    is_active: true,
  });
  const [branchFormErrors, setBranchFormErrors] = useState<Record<string, string>>({});
  const [isSavingBranch, setIsSavingBranch] = useState(false);

  // Form states - User
  const [userForm, setUserForm] = useState({
    full_name: '',
    role: 'branch_user' as 'super_admin' | 'branch_user',
    branch_id: '',
    email: '',
    password: '',
    pin: '',
    is_active: true,
  });
  const [userFormErrors, setUserFormErrors] = useState<Record<string, string>>({});
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Load data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedBranches, fetchedUsers] = await Promise.all([
        getBranches(),
        getUsers(),
      ]);
      setBranches(fetchedBranches);
      setUsers(fetchedUsers);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute users per branch
  const usersCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach((u) => {
      if (u.branch_id) {
        map[u.branch_id] = (map[u.branch_id] || 0) + 1;
      }
    });
    return map;
  }, [users]);

  // Filtered branches
  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? b.is_active
          : !b.is_active;

      return matchesSearch && matchesStatus;
    });
  }, [branches, searchQuery, statusFilter]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.branch_name && u.branch_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? u.is_active
          : !u.is_active;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  // Open Add Branch
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      code: `B${branches.length + 1}`,
      name: '',
      city: '',
      address: '',
      phone: '+91 ',
      timings: '10:00 AM - 9:30 PM',
      wa_phone_id: '',
      is_active: true,
    });
    setBranchFormErrors({});
    setBranchDrawerOpen(true);
  };

  // Open Edit Branch
  const handleOpenEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchForm({
      code: branch.code,
      name: branch.name,
      city: branch.city,
      address: branch.address,
      phone: branch.phone || '',
      timings: branch.timings || '10:00 AM - 9:30 PM',
      wa_phone_id: branch.wa_phone_id || '',
      is_active: branch.is_active,
    });
    setBranchFormErrors({});
    setBranchDrawerOpen(true);
  };

  // Save Branch
  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!branchForm.code.trim()) errors.code = 'Branch code is required';
    if (!branchForm.name.trim()) errors.name = 'Branch name is required';
    if (!branchForm.city.trim()) errors.city = 'City is required';
    if (!branchForm.address.trim()) errors.address = 'Address is required';

    if (Object.keys(errors).length > 0) {
      setBranchFormErrors(errors);
      return;
    }

    setIsSavingBranch(true);
    try {
      if (editingBranch) {
        await updateBranch(editingBranch.id, branchForm);
      } else {
        await createBranch(branchForm);
      }
      await loadData();
      setBranchDrawerOpen(false);
    } catch (err: unknown) {
      setBranchFormErrors({
        form: err instanceof Error ? err.message : 'Failed to save branch',
      });
    } finally {
      setIsSavingBranch(false);
    }
  };

  // Open Add User
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserForm({
      full_name: '',
      role: 'branch_user',
      branch_id: branches[0]?.id || '',
      email: '',
      password: '',
      pin: '',
      is_active: true,
    });
    setUserFormErrors({});
    setUserDrawerOpen(true);
  };

  // Open Edit User
  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      full_name: user.full_name,
      role: user.role,
      branch_id: user.branch_id || (branches[0]?.id || ''),
      email: user.email || '',
      password: '',
      pin: user.pin || '',
      is_active: user.is_active,
    });
    setUserFormErrors({});
    setUserDrawerOpen(true);
  };

  // Save User
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!userForm.full_name.trim()) errors.full_name = 'Full name is required';

    if (userForm.role === 'super_admin') {
      if (!userForm.email.trim()) errors.email = 'Email address is required';
      else if (!/\S+@\S+\.\S+/.test(userForm.email)) errors.email = 'Invalid email address';

      if (!editingUser && !userForm.password.trim()) {
        errors.password = 'Password is required for new admin';
      }
    } else {
      if (!userForm.branch_id) errors.branch_id = 'Please select a branch';
      if (!userForm.pin.trim()) errors.pin = 'PIN is required';
      else if (!/^\d{4,6}$/.test(userForm.pin.trim())) errors.pin = 'PIN must be 4 to 6 digits';
    }

    if (Object.keys(errors).length > 0) {
      setUserFormErrors(errors);
      return;
    }

    // Protection rule: cannot deactivate self
    if (editingUser && editingUser.id === currentUser?.id && !userForm.is_active) {
      setUserFormErrors({ form: 'You cannot deactivate your own account.' });
      return;
    }

    // Protection rule: cannot deactivate last super admin
    if (
      editingUser &&
      editingUser.role === 'super_admin' &&
      !userForm.is_active
    ) {
      const activeAdmins = users.filter((u) => u.role === 'super_admin' && u.is_active);
      if (activeAdmins.length <= 1 && activeAdmins[0]?.id === editingUser.id) {
        setUserFormErrors({ form: 'Cannot deactivate the last active Super Admin.' });
        return;
      }
    }

    setIsSavingUser(true);
    try {
      const selectedBranchObj = branches.find((b) => b.id === userForm.branch_id);
      const payload: Partial<User> = {
        full_name: userForm.full_name,
        role: userForm.role,
        is_active: userForm.is_active,
        branch_id: userForm.role === 'branch_user' ? userForm.branch_id : null,
        branch_name: userForm.role === 'branch_user' ? (selectedBranchObj?.name || null) : null,
        email: userForm.role === 'super_admin' ? userForm.email : undefined,
        pin: userForm.role === 'branch_user' ? userForm.pin : undefined,
      };

      if (userForm.password && userForm.role === 'super_admin') {
        payload.password = userForm.password;
      }

      if (editingUser) {
        await updateUser(editingUser.id, payload);
      } else {
        await createUser(payload as Omit<User, 'id'>);
      }
      await loadData();
      setUserDrawerOpen(false);
    } catch (err: unknown) {
      setUserFormErrors({
        form: err instanceof Error ? err.message : 'Failed to save user',
      });
    } finally {
      setIsSavingUser(false);
    }
  };

  // Reset credential handler
  const handleResetCredential = async (user: User) => {
    try {
      const res = await resetCredential(user.id);
      setResetModalData({
        userName: user.full_name,
        newCredential: res.newCredential,
        type: res.type,
      });
      setCopied(false);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reset credential');
    }
  };

  // Toggle active status
  const handleToggleActive = async (type: 'branch' | 'user', id: string, currentStatus: boolean, name: string) => {
    if (currentStatus) {
      // Prompt confirm dialog when deactivating
      setConfirmDeactivate({ type, id, name });
    } else {
      // Directly activate
      if (type === 'branch') {
        await updateBranch(id, { is_active: true });
      } else {
        await updateUser(id, { is_active: true });
      }
      await loadData();
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!confirmDeactivate) return;
    const { type, id } = confirmDeactivate;

    if (type === 'user') {
      if (id === currentUser?.id) {
        alert('You cannot deactivate your own account.');
        setConfirmDeactivate(null);
        return;
      }
      const targetUser = users.find((u) => u.id === id);
      if (targetUser?.role === 'super_admin') {
        const activeAdmins = users.filter((u) => u.role === 'super_admin' && u.is_active);
        if (activeAdmins.length <= 1) {
          alert('Cannot deactivate the last active Super Admin.');
          setConfirmDeactivate(null);
          return;
        }
      }
      await updateUser(id, { is_active: false });
    } else {
      await updateBranch(id, { is_active: false });
    }

    setConfirmDeactivate(null);
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-text tracking-tight">Users &amp; Branches</h1>
          <p className="text-sm text-app-muted mt-1">
            Configure multi-branch retail network and staff user permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'branches' ? (
            <Button
              onClick={handleOpenAddBranch}
              variant="primary"
              className="gap-2 bg-primary-brand hover:bg-[#0B3B2E]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Branch</span>
            </Button>
          ) : (
            <Button
              onClick={handleOpenAddUser}
              variant="primary"
              className="gap-2 bg-primary-brand hover:bg-[#0B3B2E]"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Tab Switcher with counts */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-card pb-4">
        {/* Left: Branches vs Users top-level pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('branches');
              setStatusFilter('all');
            }}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer',
              activeTab === 'branches'
                ? 'bg-primary-brand text-white shadow-sm'
                : 'bg-white text-slate-700 border border-border-card hover:bg-slate-50'
            )}
          >
            <Building2 className="w-4 h-4" />
            <span>Branches</span>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full font-bold',
                activeTab === 'branches' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              )}
            >
              {branches.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('users');
              setStatusFilter('all');
            }}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer',
              activeTab === 'users'
                ? 'bg-primary-brand text-white shadow-sm'
                : 'bg-white text-slate-700 border border-border-card hover:bg-slate-50'
            )}
          >
            <Users className="w-4 h-4" />
            <span>Users</span>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full font-bold',
                activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              )}
            >
              {users.length}
            </span>
          </button>
        </div>

        {/* Right: Sub-status filter chips */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-3 py-1 text-xs font-semibold rounded-lg transition-all',
              statusFilter === 'all'
                ? 'bg-white text-app-text shadow-xs'
                : 'text-slate-600 hover:text-app-text'
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={cn(
              'px-3 py-1 text-xs font-semibold rounded-lg transition-all',
              statusFilter === 'active'
                ? 'bg-white text-app-text shadow-xs'
                : 'text-slate-600 hover:text-app-text'
            )}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={cn(
              'px-3 py-1 text-xs font-semibold rounded-lg transition-all',
              statusFilter === 'inactive'
                ? 'bg-white text-app-text shadow-xs'
                : 'text-slate-600 hover:text-app-text'
            )}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            activeTab === 'branches'
              ? 'Search branches by code, name, city...'
              : 'Search users by name, email, branch or role...'
          }
          className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-border-card rounded-xl text-app-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-brand focus:border-transparent transition-all"
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadData}>
            Retry
          </Button>
        </div>
      )}

      {/* TAB 1: Branches Table */}
      {!loading && !error && activeTab === 'branches' && (
        <div className="bg-white rounded-2xl border border-border-card shadow-card overflow-hidden">
          {filteredBranches.length === 0 ? (
            <EmptyState
              title="No branches found"
              description={searchQuery ? 'Try adjusting your search criteria.' : 'Create your first branch.'}
              action={
                <Button onClick={handleOpenAddBranch} variant="primary" size="sm">
                  Add Branch
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8FAFA] text-slate-600 font-semibold border-b border-border-card text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 w-20">Code</th>
                    <th className="py-3.5 px-4">Branch Name</th>
                    <th className="py-3.5 px-4">City</th>
                    <th className="py-3.5 px-4">Address</th>
                    <th className="py-3.5 px-4">Timings</th>
                    <th className="py-3.5 px-4">WhatsApp / Phone</th>
                    <th className="py-3.5 px-4 text-center">Users</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-card">
                  {filteredBranches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-primary-brand">
                        {b.code}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-app-text">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-primary-brand flex-shrink-0" />
                          <span>{b.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{b.city}</td>
                      <td className="py-3.5 px-4 text-app-muted max-w-xs truncate" title={b.address}>
                        {b.address}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.timings || '10:00 AM - 9:30 PM'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.phone || b.wa_phone_id || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-semibold text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                          {usersCountMap[b.id] || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {b.is_active ? (
                          <Pill variant="green" dot>
                            Active
                          </Pill>
                        ) : (
                          <Pill variant="red" dot>
                            Inactive
                          </Pill>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditBranch(b)}
                            className="text-xs font-semibold text-primary-brand hover:underline px-2 py-1 rounded cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive('branch', b.id, b.is_active, b.name)}
                            className={cn(
                              'text-xs font-semibold px-2 py-1 rounded cursor-pointer transition-colors',
                              b.is_active
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            )}
                          >
                            {b.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Users Table */}
      {!loading && !error && activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-border-card shadow-card overflow-hidden">
          {filteredUsers.length === 0 ? (
            <EmptyState
              title="No users found"
              description={searchQuery ? 'Try adjusting your search criteria.' : 'Add your first staff user account.'}
              action={
                <Button onClick={handleOpenAddUser} variant="primary" size="sm">
                  Add User
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8FAFA] text-slate-600 font-semibold border-b border-border-card text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">User Name</th>
                    <th className="py-3.5 px-4">Login Type</th>
                    <th className="py-3.5 px-4">Branch</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Last Login</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-card">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-brand/10 text-primary-brand font-bold text-xs flex items-center justify-center">
                              {u.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-app-text flex items-center gap-1.5">
                                <span>{u.full_name}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                                    You
                                  </span>
                                )}
                              </div>
                              {u.email && <div className="text-xs text-app-muted">{u.email}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 text-xs">
                          {u.role === 'super_admin' ? (
                            <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                              <span>Email &amp; Password</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-700 font-medium font-mono">
                              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                              <span>Branch PIN ({u.pin ? '••••' : 'Not set'})</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {u.branch_name ? (
                            <div className="flex items-center gap-1.5">
                              <Store className="w-3.5 h-3.5 text-primary-brand flex-shrink-0" />
                              <span>{u.branch_name}</span>
                            </div>
                          ) : (
                            <span className="text-app-muted italic">All Branches (Head Office)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {u.role === 'super_admin' ? (
                            <Pill variant="mint">Super Admin</Pill>
                          ) : (
                            <Pill variant="blue">Branch User</Pill>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-app-muted">
                          {u.last_login_at
                            ? new Date(u.last_login_at).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : 'Never'}
                        </td>
                        <td className="py-3.5 px-4">
                          {u.is_active ? (
                            <Pill variant="green" dot>
                              Active
                            </Pill>
                          ) : (
                            <Pill variant="red" dot>
                              Inactive
                            </Pill>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleResetCredential(u)}
                              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
                              title="Generate new PIN or Password"
                            >
                              Reset {u.role === 'super_admin' ? 'Pass' : 'PIN'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(u)}
                              className="text-xs font-semibold text-primary-brand hover:underline px-2 py-1 rounded cursor-pointer"
                            >
                              Edit
                            </button>
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => handleToggleActive('user', u.id, u.is_active, u.full_name)}
                                className={cn(
                                  'text-xs font-semibold px-2 py-1 rounded cursor-pointer transition-colors',
                                  u.is_active
                                    ? 'text-red-600 hover:bg-red-50'
                                    : 'text-emerald-700 hover:bg-emerald-50'
                                )}
                              >
                                {u.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DRAWER: Add/Edit Branch */}
      <Drawer
        isOpen={branchDrawerOpen}
        onClose={() => setBranchDrawerOpen(false)}
        title={editingBranch ? 'Edit Store Branch' : 'Add Store Branch'}
        subtitle="Manage branch profile, location details and opening hours"
        width="w-full sm:w-[480px]"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              type="button"
              onClick={() => setBranchDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={handleSaveBranch}
              disabled={isSavingBranch}
              className="bg-primary-brand"
            >
              {isSavingBranch && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              <span>{editingBranch ? 'Save Changes' : 'Create Branch'}</span>
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveBranch} className="space-y-4">
          {branchFormErrors.form && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
              {branchFormErrors.form}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-app-text mb-1.5">
                Branch Code *
              </label>
              <input
                type="text"
                value={branchForm.code}
                onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })}
                placeholder="e.g. B5"
                className="w-full h-10 px-3 text-sm bg-white border border-border-card rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-accent-brand"
              />
              {branchFormErrors.code && (
                <p className="text-xs text-red-600 mt-1">{branchFormErrors.code}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-text mb-1.5">
                City *
              </label>
              <input
                type="text"
                value={branchForm.city}
                onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                placeholder="e.g. Vizag"
                className="w-full h-10 px-3 text-sm bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
              />
              {branchFormErrors.city && (
                <p className="text-xs text-red-600 mt-1">{branchFormErrors.city}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-text mb-1.5">
              Branch Name *
            </label>
            <input
              type="text"
              value={branchForm.name}
              onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
              placeholder="e.g. Vizag Beach Road Branch"
              className="w-full h-10 px-3 text-sm bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
            />
            {branchFormErrors.name && (
              <p className="text-xs text-red-600 mt-1">{branchFormErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-text mb-1.5">
              Address *
            </label>
            <textarea
              rows={3}
              value={branchForm.address}
              onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
              placeholder="Full physical street address with pincode..."
              className="w-full p-3 text-sm bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
            />
            {branchFormErrors.address && (
              <p className="text-xs text-red-600 mt-1">{branchFormErrors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-app-text mb-1.5">
                Opening Timings
              </label>
              <input
                type="text"
                value={branchForm.timings}
                onChange={(e) => setBranchForm({ ...branchForm, timings: e.target.value })}
                placeholder="10:00 AM - 9:30 PM"
                className="w-full h-10 px-3 text-sm bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-text mb-1.5">
                Store Phone
              </label>
              <input
                type="text"
                value={branchForm.phone}
                onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full h-10 px-3 text-sm bg-white border border-border-card rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-accent-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-text mb-1.5">
              WhatsApp Sender ID / Number
            </label>
            <input
              type="text"
              value={branchForm.wa_phone_id}
              onChange={(e) => setBranchForm({ ...branchForm, wa_phone_id: e.target.value })}
              placeholder="e.g. wa_b5_vizag or +919876543210"
              className="w-full h-10 px-3 text-sm bg-white border border-border-card rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-accent-brand"
            />
          </div>

          <div className="pt-2 border-t border-border-card flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-app-text block">Active Branch</span>
              <span className="text-xs text-app-muted">
                Inactive branches are hidden from login and dropdowns
              </span>
            </div>
            <Toggle
              checked={branchForm.is_active}
              onChange={(checked) => setBranchForm({ ...branchForm, is_active: checked })}
            />
          </div>
        </form>
      </Drawer>

      {/* DRAWER: Add/Edit User */}
      <Drawer
        isOpen={userDrawerOpen}
        onClose={() => setUserDrawerOpen(false)}
        title={editingUser ? 'Edit Staff User' : 'Add Staff User'}
        subtitle="Manage user credentials, role and store assignment"
        width="w-full sm:w-[480px]"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              type="button"
              onClick={() => setUserDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={handleSaveUser}
              disabled={isSavingUser}
              className="bg-primary-brand"
            >
              {isSavingUser && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              <span>{editingUser ? 'Save User' : 'Create User'}</span>
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          {userFormErrors.form && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
              {userFormErrors.form}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-app-text mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              value={userForm.full_name}
              onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
              placeholder="e.g. Ramesh Varma"
              className="w-full h-10 px-3 text-sm bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
            />
            {userFormErrors.full_name && (
              <p className="text-xs text-red-600 mt-1">{userFormErrors.full_name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-text mb-1.5">
              User Role *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserForm({ ...userForm, role: 'branch_user' })}
                className={cn(
                  'h-11 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all',
                  userForm.role === 'branch_user'
                    ? 'border-primary-brand bg-primary-brand/5 text-primary-brand ring-1 ring-primary-brand'
                    : 'border-border-card bg-white text-slate-700 hover:bg-slate-50'
                )}
              >
                <Store className="w-4 h-4" />
                <span>Branch User</span>
              </button>

              <button
                type="button"
                onClick={() => setUserForm({ ...userForm, role: 'super_admin' })}
                className={cn(
                  'h-11 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all',
                  userForm.role === 'super_admin'
                    ? 'border-primary-brand bg-primary-brand/5 text-primary-brand ring-1 ring-primary-brand'
                    : 'border-border-card bg-white text-slate-700 hover:bg-slate-50'
                )}
              >
                <Building2 className="w-4 h-4" />
                <span>Super Admin</span>
              </button>
            </div>
          </div>

          {/* If Super Admin: Email and Password */}
          {userForm.role === 'super_admin' ? (
            <div className="space-y-4 pt-2 border-t border-border-card">
              <div>
                <label className="block text-xs font-semibold text-app-text mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="admin@rsmensworld.com"
                  className="w-full h-10 px-3 text-sm bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
                />
                {userFormErrors.email && (
                  <p className="text-xs text-red-600 mt-1">{userFormErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-text mb-1.5">
                  {editingUser ? 'New Password (leave blank to keep)' : 'Password *'}
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 text-sm bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
                />
                {userFormErrors.password && (
                  <p className="text-xs text-red-600 mt-1">{userFormErrors.password}</p>
                )}
              </div>
            </div>
          ) : (
            /* If Branch User: Branch Selector and PIN */
            <div className="space-y-4 pt-2 border-t border-border-card">
              <div>
                <label className="block text-xs font-semibold text-app-text mb-1.5">
                  Assigned Branch *
                </label>
                <select
                  value={userForm.branch_id}
                  onChange={(e) => setUserForm({ ...userForm, branch_id: e.target.value })}
                  className="w-full h-10 px-3 text-sm bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
                >
                  <option value="">Select a branch...</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} – {b.name}
                    </option>
                  ))}
                </select>
                {userFormErrors.branch_id && (
                  <p className="text-xs text-red-600 mt-1">{userFormErrors.branch_id}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-text mb-1.5">
                  Branch PIN (4–6 digits) *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={userForm.pin}
                  onChange={(e) =>
                    setUserForm({ ...userForm, pin: e.target.value.replace(/\D/g, '') })
                  }
                  placeholder="e.g. 5555"
                  className="w-full h-10 px-3 text-sm bg-white border border-border-card rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-accent-brand"
                />
                {userFormErrors.pin && (
                  <p className="text-xs text-red-600 mt-1">{userFormErrors.pin}</p>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-border-card flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-app-text block">Active Account</span>
              <span className="text-xs text-app-muted">
                Deactivated users are blocked from logging in
              </span>
            </div>
            <Toggle
              checked={userForm.is_active}
              onChange={(checked) => setUserForm({ ...userForm, is_active: checked })}
            />
          </div>
        </form>
      </Drawer>

      {/* MODAL: Reset Credential Result */}
      {resetModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-accent-brand/20 text-[#0F4C3A] flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-app-text">New Credential Generated</h3>
            <p className="text-xs text-app-muted mt-1">
              Temporary {resetModalData.type === 'password' ? 'password' : 'PIN'} for{' '}
              <strong>{resetModalData.userName}</strong>. This is shown only once.
            </p>

            <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="font-mono text-xl font-bold tracking-wider text-app-text">
                {resetModalData.newCredential}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(resetModalData.newCredential);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 text-slate-500 hover:text-primary-brand rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                onClick={() => setResetModalData(null)}
                className="w-full bg-primary-brand"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL: Deactivation */}
      {confirmDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-app-text">
              Deactivate {confirmDeactivate.type === 'branch' ? 'Branch' : 'User'}?
            </h3>
            <p className="text-sm text-app-muted mt-2">
              Are you sure you want to deactivate <strong>{confirmDeactivate.name}</strong>?
              {confirmDeactivate.type === 'branch'
                ? ' This branch will immediately be hidden from login options and store selectors.'
                : ' This user will immediately be blocked from logging into the platform.'}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setConfirmDeactivate(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDeactivate}
              >
                Deactivate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
