import React from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", isDanger = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 min-h-screen">
      <div className="border border-outline-variant/30 corner-cut max-w-sm w-full p-6 shadow-2xl relative">
        <div className={`absolute top-0 left-0 w-1 h-full ${isDanger ? 'bg-accent-yellow' : 'bg-primary'}`}></div>
        
    <h4 className={`text-xl font-headline tracking-tighter mb-2 ${isDanger ? 'text-accent-yellow' : 'text-off-white'}`}>
          {title}
        </h4>
        <p className="text-sm text-off-white font-body leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel} 
      className="px-4 py-2 border border-outline-variant/30 text-primary hover:text-white hover:transition-colors font-label text-xs tracking-widest"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
      className={`px-4 py-2 border font-label text-xs tracking-widest transition-all ${isDanger ? 'bg-accent-yellow/20 text-accent-yellow border-accent-yellow/50 hover:bg-accent-yellow/40' : 'bg-primary/20 text-primary border-primary/50 hover:bg-primary/40'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
