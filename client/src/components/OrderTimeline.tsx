import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Order } from '../types';
import { Link } from 'react-router-dom';

interface OrderTimelineProps {
  order: Order | null;
  onReupload?: () => void;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order, onReupload }) => {
  if (!order) {
    return (
      <div className="bg-sand-100/70 border border-gold-400/40 rounded-2xl p-5 sm:p-6 text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-gold-400/20 text-gold-600 flex items-center justify-center">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-sans font-bold text-obsidian">No Active Template Selected</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
            Choose an invitation design and submit your payment slip to activate your wedding invitation portal and guest list.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-black transition-colors min-h-[44px]"
        >
          Browse Templates
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const { status, note, template } = order;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Template Order</span>
          <h3 className="text-base sm:text-lg font-sans font-bold text-obsidian mt-0.5">
            {template.name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Order ID: #{order.id.slice(0, 8)}</span>
          <span className="text-xs font-semibold text-slate-700 bg-sand-100 px-2.5 py-1 rounded-full">
            Rs. {template.priceLkr.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3-Step Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Step 1: Slip Submitted */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-sand-50/80 border border-slate-100">
          <div className="rounded-full bg-emerald-600 text-white p-1 shrink-0 mt-0.5">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-obsidian">1. Slip Uploaded</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Bank transfer receipt submitted</p>
          </div>
        </div>

        {/* Step 2: Verification */}
        <div
          className={`flex items-start gap-3 p-3.5 rounded-xl border ${
            status === 'APPROVED'
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
              : status === 'REJECTED'
              ? 'bg-rose-50/60 border-rose-200 text-rose-800'
              : 'bg-amber-50/60 border-amber-200 text-amber-800'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {status === 'APPROVED' && (
              <div className="rounded-full bg-emerald-600 text-white p-1">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}
            {status === 'REJECTED' && (
              <div className="rounded-full bg-rose-600 text-white p-1">
                <XCircle className="h-4 w-4" />
              </div>
            )}
            {status === 'PENDING' && (
              <div className="rounded-full bg-amber-500 text-white p-1 animate-pulse">
                <Clock className="h-4 w-4" />
              </div>
            )}
          </div>
          <div>
            <h4 className="text-xs font-semibold">
              {status === 'APPROVED'
                ? '2. Payment Verified'
                : status === 'REJECTED'
                ? '2. Verification Issue'
                : '2. Verification Pending'}
            </h4>
            <p className="text-[11px] opacity-80 mt-0.5">
              {status === 'APPROVED'
                ? 'Confirmed by admin team'
                : status === 'REJECTED'
                ? 'Requires couple action'
                : 'Usually verified within 1-6 hours'}
            </p>
          </div>
        </div>

        {/* Step 3: Portal & Guest List Unlocked */}
        <div
          className={`flex items-start gap-3 p-3.5 rounded-xl border ${
            status === 'APPROVED'
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
              : 'bg-slate-50 border-slate-100 text-slate-400'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {status === 'APPROVED' ? (
              <div className="rounded-full bg-emerald-600 text-white p-1">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            ) : (
              <div className="rounded-full border border-slate-300 p-1 text-slate-300">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}
          </div>
          <div>
            <h4 className="text-xs font-semibold">3. Full Access Active</h4>
            <p className="text-[11px] opacity-80 mt-0.5">
              {status === 'APPROVED'
                ? 'Customizer & Guest List unlocked'
                : 'Locked until approval'}
            </p>
          </div>
        </div>
      </div>

      {/* Rejected Alert Banner with Admin Note */}
      {status === 'REJECTED' && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-rose-900">Payment Slip Review Note from Admin</h4>
              <p className="text-xs text-rose-700 leading-relaxed">
                {note || 'Your payment slip could not be confirmed. Please ensure the transaction reference, amount, and date are clearly legible.'}
              </p>
            </div>
          </div>
          {onReupload && (
            <div className="pt-2">
              <button
                onClick={onReupload}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors min-h-[44px]"
              >
                Upload Corrected Payment Slip
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pending Reassurance Message */}
      {status === 'PENDING' && (
        <div className="rounded-xl bg-amber-50/70 border border-amber-200/70 p-3.5 text-xs text-amber-800 flex items-center gap-2.5">
          <Clock className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            We have received your transfer slip. Our team reviews receipts throughout the day. Your invitation editor and guest list will activate automatically once approved!
          </span>
        </div>
      )}
    </div>
  );
};
