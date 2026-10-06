import React from 'react';

export const CatalogSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="h-74 bg-slate-200 w-full" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-slate-200 rounded-md w-3/4" />
            <div className="h-4 bg-slate-200 rounded-md w-full" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-slate-200 rounded-md w-24" />
              <div className="h-10 bg-slate-200 rounded-xl w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Banner */}
      <div className="h-32 bg-slate-200 rounded-2xl w-full" />
      {/* 2 Grid items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-48 bg-slate-200 rounded-2xl" />
        <div className="h-48 bg-slate-200 rounded-2xl" />
      </div>
      {/* Table skeleton */}
      <div className="h-64 bg-slate-200 rounded-2xl" />
    </div>
  );
};

export const GuestSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="space-y-1.5 w-1/2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
          <div className="h-8 bg-slate-200 rounded-lg w-20" />
        </div>
      ))}
    </div>
  );
};
