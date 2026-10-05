import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { fetchOrders, reviewOrder } from '../lib/api';
import { Order } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Eye, CheckCircle, XCircle, ExternalLink, RefreshCw } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  
  const queryClient = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useQuery({ 
    queryKey: ['orders'], 
    queryFn: fetchOrders 
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: 'APPROVED' | 'REJECTED'; note?: string }) => 
      reviewOrder(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated');
      setSelectedOrder(null);
      setReviewNote('');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to review order'),
  });

  const orders = data?.orders || [];
  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    approved: orders.filter(o => o.status === 'APPROVED').length,
    rejected: orders.filter(o => o.status === 'REJECTED').length,
  };

  const handleReview = (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedOrder) return;
    reviewMutation.mutate({ id: selectedOrder.id, status, note: reviewNote });
  };

  if (isLoading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Title & Refresh */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage and verify customer payment slips</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats - 2x2 on mobile, 4 in row on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[
          { label: 'Total Orders', value: stats.total, color: 'text-slate-900', bg: 'bg-white' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50/40' },
          { label: 'Approved', value: stats.approved, color: 'text-green-600', bg: 'bg-green-50/40' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-600', bg: 'bg-red-50/40' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} p-3 sm:p-5 rounded-xl shadow-2xs border border-slate-100 flex flex-col justify-between`}>
            <dt className="text-xs sm:text-sm font-medium text-slate-500 truncate">{stat.label}</dt>
            <dd className={`mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold tracking-tight ${stat.color}`}>{stat.value}</dd>
          </div>
        ))}
      </div>

      {/* Filter Tabs - horizontally scrollable without breaking */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto pb-1" aria-label="Tabs">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => {
            const count = f === 'ALL' ? stats.total : f === 'PENDING' ? stats.pending : f === 'APPROVED' ? stats.approved : stats.rejected;
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 font-medium'
                } whitespace-nowrap border-b-2 py-2.5 sm:py-3 px-2 sm:px-1 text-xs sm:text-sm transition-colors flex items-center gap-1.5 shrink-0`}
              >
                <span>{f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[11px] font-medium ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Card List View (hidden on desktop) */}
      <div className="block md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-slate-500 text-sm border border-slate-100 shadow-2xs">
            No orders found in this category.
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  #{order.id.slice(0, 8)}
                </span>
                <StatusBadge status={order.status} />
              </div>

              <div>
                <h3 className="font-semibold text-sm text-slate-900">
                  {order.user.brideName} & {order.user.groomName}
                </h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">{order.user.email}</p>
                {order.user.phone && (
                  <p className="text-xs text-slate-500 mt-0.5">{order.user.phone}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
                <div>
                  <span className="text-slate-400">Template: </span>
                  <span className="font-medium text-slate-700">{order.template.name}</span>
                </div>
                <div className="font-bold text-slate-900">
                  Rs. {order.template.priceLkr.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Ordered: {format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                {order.reviewedAt && (
                  <span>Reviewed: {format(new Date(order.reviewedAt), 'MMM d')}</span>
                )}
              </div>

              <button
                onClick={() => { setSelectedOrder(order); setReviewNote(order.note || ''); }}
                className="w-full mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 px-3 text-xs font-semibold transition-colors min-h-[44px]"
              >
                <Eye className="h-4 w-4" />
                <span>View Details & Review Slip</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Couple</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Template</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-semibold text-slate-700">#{order.id.slice(0,8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{order.user.brideName} & {order.user.groomName}</div>
                      <div className="text-xs text-slate-500">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{order.template.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">Rs. {order.template.priceLkr.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => { setSelectedOrder(order); setReviewNote(order.note || ''); }}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1 font-medium transition-colors"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal with Mobile Responsive Form and Actions */}
      <Modal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        title={`Order #${selectedOrder?.id.slice(0, 8)} Details`}
      >
        {selectedOrder && (
          <div className="space-y-4 sm:space-y-6">
            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Couple Information</h4>
                <p className="text-sm font-semibold text-slate-900">{selectedOrder.user.brideName} & {selectedOrder.user.groomName}</p>
                <p className="text-xs text-slate-600 mt-1">{selectedOrder.user.email}</p>
                <p className="text-xs text-slate-600">{selectedOrder.user.phone}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Package Details</h4>
                <p className="text-sm font-semibold text-slate-900">{selectedOrder.template.name}</p>
                <p className="text-sm font-bold text-indigo-600 mt-1">Rs. {selectedOrder.template.priceLkr.toLocaleString()}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-slate-400">Current Status:</span>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
            </div>

            {/* Slip Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bank Transfer Slip</h4>
                {selectedOrder.signedSlipUrl && (
                  <a
                    href={selectedOrder.signedSlipUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <span>Open Full Image</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              {selectedOrder.signedSlipUrl ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden flex justify-center bg-slate-900/5 p-2">
                  <img 
                    src={selectedOrder.signedSlipUrl} 
                    alt="Payment Slip" 
                    className="max-h-64 sm:max-h-80 w-auto object-contain rounded-lg shadow-2xs"
                  />
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-xl text-center border border-slate-200">
                  <p className="text-sm text-slate-500 italic">No slip uploaded for this order.</p>
                </div>
              )}
            </div>

            {/* Existing Review Note */}
            {selectedOrder.status !== 'PENDING' && selectedOrder.note && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Reviewer Note</h4>
                <div className="p-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-700 border border-slate-200">
                  {selectedOrder.note}
                </div>
              </div>
            )}

            {/* Pending Actions */}
            {selectedOrder.status === 'PENDING' && (
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div>
                  <label htmlFor="note" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Approval / Rejection Note (Optional)
                  </label>
                  <textarea
                    id="note"
                    rows={2}
                    className="mt-1 block w-full rounded-xl border border-slate-300 py-2 px-3 text-sm shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="E.g., Bank slip confirmed, access approved."
                    value={reviewNote}
                    onChange={e => setReviewNote(e.target.value)}
                  />
                </div>
                
                {/* Touch-friendly buttons (stacked on mobile, inline on desktop) */}
                <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 sm:justify-end pt-2">
                  <button
                    onClick={() => handleReview('REJECTED')}
                    disabled={reviewMutation.isPending}
                    className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-2xs ring-1 ring-inset ring-red-300 hover:bg-red-50 disabled:opacity-50 transition-colors min-h-[44px]"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Reject Order
                  </button>
                  <button
                    onClick={() => handleReview('APPROVED')}
                    disabled={reviewMutation.isPending}
                    className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-2xs hover:bg-indigo-700 disabled:opacity-50 transition-colors min-h-[44px]"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Approve Order
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

