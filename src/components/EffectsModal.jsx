import React from 'react';
import Tooltip from './Tooltip';
import NavigationIcon from './NavigationIcon';

export default function EffectsModal({ isOpen, onClose, onAddEffect, activeEffects, availableEffects }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl border border-tertiary bg-gradient-to-b from-[#2E181B] to-[#0D1216] flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="px-4 py-2 flex justify-between items-center relative">
          <div className="w-8"></div> {/* Spacer */}
          <h2 className="flex items-center gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 m-0 pointer-events-none">
            Add Effect
          </h2>
          <NavigationIcon icon="close" onClick={onClose} className="w-8 h-8 !transform-none pointer-events-auto" />
        </div>
        
        {/* Body: Grid of Effects */}
        <div className="p-4 overflow-y-auto flex-1 ">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableEffects.map((effectObj, idx) => {
              const { name, desc } = effectObj;
              const isActive = activeEffects.some(e => e.name === name);
              
              return (
                <Tooltip key={`${name}-${idx}`} content={desc} className="block">
                  <button
                    onClick={() => {
                      onAddEffect(name);
                      onClose();
                    }}
                    className={`text-center px-4 py-2 relative transition-colors w-full h-8 flex items-center justify-center font-label font-[700] text-xs uppercase tracking-widest text-[#FCFAED] active:scale-95
                      ${isActive ? 'bordered-corner-alt opacity-50 cursor-default pointer-events-none' : 'bordered-corner-alt cursor-pointer text-primary'}
                    `}
                  >
                    <span className="relative bottom-[1px] line-clamp-1 truncate">{name}</span>
                  </button>
                </Tooltip>
              );
            })}
            
            {availableEffects.length === 0 && (
              <div className="col-span-full p-8 text-center text-primary/50 text-xs tracking-widest font-label uppercase">
                No active abilities found in this encounter to track as effects.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
