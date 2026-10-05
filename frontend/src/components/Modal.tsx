import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
        aria-hidden="true"
      />
      
      {/* Modal Dialog */}
      <div className="relative w-full sm:max-w-2xl transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white p-4 sm:p-6 text-left align-middle shadow-2xl transition-all max-h-[90dvh] flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate pr-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3 sm:py-4 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};

