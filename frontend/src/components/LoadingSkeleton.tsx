import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="animate-pulse flex flex-col gap-4 w-full">
      <div className="h-10 bg-slate-200 rounded w-full mb-4"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="h-12 bg-slate-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
};
