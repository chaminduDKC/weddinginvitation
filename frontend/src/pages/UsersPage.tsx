import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { fetchUsers, toggleUserStatus, deleteUser } from '../lib/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Modal } from '../components/Modal';
import { useAuth } from '../lib/auth';
import { AdminUser } from '../types';
import { Search, Shield, User as UserIcon, Phone, Mail, CheckCircle2, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const { user: currentAdmin } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['users', debouncedSearch],
    queryFn: () => fetchUsers(debouncedSearch),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to update user status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User and all associated records permanently deleted');
      setUserToDelete(null);
    },
    onError: (error: any) => toast.error(error.message || 'Failed to delete user'),
  });

  const users = data?.users || [];

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    verified: users.filter(u => u.emailVerifiedAt).length,
  };

  const handleToggleStatus = (id: string, currentStatus: boolean, userName: string) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} account for ${userName}?`)) {
      toggleMutation.mutate({ id, isActive: !currentStatus });
    }
  };

  if (isLoading && !users.length) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Title & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Users</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage customer accounts and access permissions</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              className="block w-full rounded-xl border border-slate-300 py-2 sm:py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-colors shrink-0 h-[38px]"
            aria-label="Refresh user list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats - 2x2 grid on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-slate-900', bg: 'bg-white' },
          { label: 'Active', value: stats.active, color: 'text-green-600', bg: 'bg-green-50/40' },
          { label: 'Inactive', value: stats.inactive, color: 'text-red-600', bg: 'bg-red-50/40' },
          { label: 'Verified', value: stats.verified, color: 'text-indigo-600', bg: 'bg-indigo-50/40' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} p-3 sm:p-5 rounded-xl shadow-2xs border border-slate-100 flex flex-col justify-between`}>
            <dt className="text-xs sm:text-sm font-medium text-slate-500 truncate">{stat.label}</dt>
            <dd className={`mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold tracking-tight ${stat.color}`}>{stat.value}</dd>
          </div>
        ))}
      </div>

      {/* Mobile Card List View (hidden on desktop) */}
      <div className="block md:hidden space-y-3">
        {users.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-slate-500 text-sm border border-slate-100 shadow-2xs">
            No users found matching "{search}".
          </div>
        ) : (
          users.map(user => {
            const coupleName = user.brideName && user.groomName 
              ? `${user.brideName} & ${user.groomName}` 
              : user.brideName || user.email;

            return (
              <div key={user.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
                {/* Header: Name, Role & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">
                      {coupleName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                        user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' : 'bg-slate-50 text-slate-600 ring-slate-500/20'
                      }`}>
                        {user.role === 'ADMIN' ? <Shield className="mr-1 h-3 w-3" /> : <UserIcon className="mr-1 h-3 w-3" />}
                        {user.role}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {user.emailVerifiedAt && (
                        <span className="inline-flex items-center text-[11px] text-indigo-600 font-medium gap-0.5">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Links (Tap to email/call) */}
                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <a href={`mailto:${user.email}`} className="flex items-center gap-2 hover:text-indigo-600 truncate py-0.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </a>
                  {user.phone && (
                    <a href={`tel:${user.phone}`} className="flex items-center gap-2 hover:text-indigo-600 py-0.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{user.phone}</span>
                    </a>
                  )}
                </div>

                {/* Meta details */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Orders: <strong className="text-slate-900">{user._count?.orders || 0}</strong></span>
                  <span>Joined: {format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                </div>

                {/* Action buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => handleToggleStatus(user.id, user.isActive, coupleName)}
                    disabled={toggleMutation.isPending || user.role === 'ADMIN'}
                    className={`w-full inline-flex items-center justify-center rounded-lg py-2.5 px-3 text-xs font-semibold transition-colors min-h-[44px] ${
                      user.role === 'ADMIN'
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : user.isActive
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 ring-1 ring-inset ring-amber-200'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-inset ring-green-200'
                    }`}
                  >
                    {user.role === 'ADMIN' 
                      ? 'Admin Account (Protected)' 
                      : user.isActive 
                        ? 'Deactivate User Account' 
                        : 'Activate User Account'}
                  </button>

                  {user.id !== currentAdmin?.id && user.role !== 'ADMIN' && (
                    <button
                      onClick={() => setUserToDelete(user)}
                      disabled={deleteMutation.isPending}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg py-2.5 px-3 text-xs font-semibold text-red-600 bg-red-50/50 hover:bg-red-50 ring-1 ring-inset ring-red-200 min-h-[44px] transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete User & All Records</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Orders</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No users found matching "{search}".
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{user.brideName} & {user.groomName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{user.email}</div>
                      <div className="text-xs text-slate-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' : 'bg-slate-50 text-slate-600 ring-slate-500/20'
                      }`}>
                        {user.role === 'ADMIN' ? <Shield className="mr-1 h-3 w-3" /> : <UserIcon className="mr-1 h-3 w-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {user.emailVerifiedAt && (
                          <span className="inline-flex items-center text-xs text-indigo-600 font-medium">Verified</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {user._count?.orders || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.isActive, `${user.brideName} & ${user.groomName}`)}
                          disabled={toggleMutation.isPending || user.role === 'ADMIN'}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                            user.role === 'ADMIN' 
                              ? 'text-slate-300 border-slate-200 cursor-not-allowed' 
                              : user.isActive 
                                ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100' 
                                : 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        {user.id !== currentAdmin?.id && user.role !== 'ADMIN' && (
                          <button
                            onClick={() => setUserToDelete(user)}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                            title="Delete User & All Associated Records"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => {
          if (!deleteMutation.isPending) setUserToDelete(null);
        }}
        title="Delete User Confirmation"
      >
        {userToDelete && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
              <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm space-y-1.5">
                <p className="font-bold text-red-950 text-sm">
                  Permanently delete user and all associated records?
                </p>
                <p className="text-red-800 leading-relaxed">
                  Are you sure you want to delete user <strong>{userToDelete.brideName} & {userToDelete.groomName}</strong> ({userToDelete.email})?
                </p>
                <div className="bg-white/90 p-3 rounded-lg border border-red-200 text-xs text-red-900 space-y-1">
                  <p className="font-semibold">The following data will be permanently removed:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-red-800 pl-1 font-medium">
                    <li>All template orders ({userToDelete._count?.orders || 0}) and uploaded payment slips</li>
                    <li>All customized wedding invitations ({userToDelete._count?.invitations || 0})</li>
                    <li>All wedding guests ({userToDelete._count?.guests || 0}) and their private token links</li>
                    <li>Authentication tokens and OTP verification records</li>
                  </ul>
                </div>
                <p className="text-red-900 font-bold text-xs pt-1">
                  ⚠️ This action is irreversible and cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => setUserToDelete(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(userToDelete.id)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors min-h-[44px]"
              >
                <Trash2 className="h-4 w-4" />
                <span>{deleteMutation.isPending ? 'Deleting...' : 'Delete User & All Records'}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

