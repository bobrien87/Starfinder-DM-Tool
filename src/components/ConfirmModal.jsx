import React from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", isDanger = true }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 min-h-screen">
            <div className="bg-surface-container-highest border border-outline-variant/30 corner-cut max-w-sm w-full p-6 shadow-2xl relative">
                <div className={`absolute top-0 left-0 w-1 h-full ${isDanger ? 'bg-error' : 'bg-primary'}`}></div>
                
                <h3 className={`text-xl font-black font-headline tracking-tighter uppercase mb-2 ${isDanger ? 'text-error' : 'text-primary'}`}>
                    {title}
                </h3>
                <p className="text-sm text-secondary font-body leading-relaxed mb-6">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onCancel} 
                        className="px-4 py-2 border border-outline-variant/30 text-secondary hover:text-white hover:bg-surface-container-lowest transition-colors font-bold font-label text-xs uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className={`px-4 py-2 border font-bold font-label text-xs uppercase tracking-widest transition-all ${isDanger ? 'bg-error/20 text-error border-error/50 hover:bg-error/40' : 'bg-primary/20 text-primary border-primary/50 hover:bg-primary/40'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
