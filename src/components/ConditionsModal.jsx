import React from 'react';
import { CONDITIONS } from '../data/conditions';
import Tooltip from './Tooltip';

export default function ConditionsModal({ isOpen, onClose, onAddCondition, activeConditions }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            
            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-surface-container-high border-2 border-primary/50 shadow-[0_0_40px_rgba(195,245,255,0.15)] corner-cut flex flex-col max-h-[80vh]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-transparent"></div>
                
                {/* Header */}
                <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-primary/5">
                    <h2 className="text-sm font-bold font-label text-primary uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">healing</span>
                        Add Condition
                    </h2>
                    <button onClick={onClose} className="text-secondary hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>
                
                {/* Body: Grid of Conditions */}
                <div className="p-4 overflow-y-auto flex-1 bg-surface">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.keys(CONDITIONS).sort().map(name => {
                            const def = CONDITIONS[name];
                            const isActive = activeConditions.some(c => c.name === name);
                            
                            return (
                                <Tooltip key={name} content={def?.desc} className="block">
                                    <button
                                        onClick={() => {
                                            onAddCondition(name);
                                            onClose();
                                        }}
                                        className={`text-center p-2 border overflow-hidden relative group transition-all w-full h-full
                                            ${isActive ? 'bg-primary/20 border-primary cursor-default opacity-50 pointer-events-none' : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary/60 hover:bg-primary/10 cursor-pointer'}
                                        `}
                                    >
                                        <span className={`text-xs font-bold font-label uppercase tracking-widest ${def.isBuff ? 'text-success' : 'text-error'}`}>
                                            {name}
                                        </span>
                                    </button>
                                </Tooltip>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
