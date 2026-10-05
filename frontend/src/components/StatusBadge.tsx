import React from 'react';

export const StatusBadge: React.FC<{ status: 'PENDING' | 'APPROVED' | 'REJECTED' }> = ({ status }) => {
  const styles = {
    PENDING: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    APPROVED: 'bg-green-50 text-green-700 ring-green-600/20',
    REJECTED: 'bg-red-50 text-red-700 ring-red-600/10'
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
      {status}
    </span>
  );
};
