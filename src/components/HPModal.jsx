import React, { useState, useEffect, useRef } from 'react';
import NavigationIcon from './NavigationIcon';

export default function HPModal({ 
  isOpen, 
  onClose, 
  combatantName, 
  currentHp, 
  tempHp, 
  maxOverride, 
  finalMaxHp,
  onSave 
}) {
  const [modValue, setModValue] = useState('');
  const [editTemp, setEditTemp] = useState('');
  const [editMax, setEditMax] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setModValue('');
      setEditTemp(tempHp || '');
      setEditMax(maxOverride || '');
      
      // Request animation frame ensures DOM elements exist before checking bounds
      requestAnimationFrame(() => {
        if (modalRef.current) {
          const rect = modalRef.current.getBoundingClientRect();
          const margin = 16;
          
          let bottomBound = window.innerHeight;
          const footerTag = document.querySelector('footer');
          if (footerTag) {
            const footerRect = footerTag.getBoundingClientRect();
            // Prevent overlaying the top plane of the system footer
            if (footerRect.top > 0) bottomBound = Math.min(bottomBound, footerRect.top);
          }

          // Clean transition resets
          modalRef.current.style.transform = `translateY(0px)`;
          if (rect.bottom > bottomBound - margin) {
            const overflow = rect.bottom - bottomBound + margin;
            modalRef.current.style.transform = `translateY(-${Math.max(0, overflow)}px)`;
          }
        }
      });
    }
  }, [isOpen, tempHp, maxOverride]);

  if (!isOpen) return null;

  const getEffectiveMax = () => {
    return editMax !== '' && editMax !== null ? parseInt(editMax) || 0 : finalMaxHp;
  };

  const handleHeal = () => {
    const amount = parseInt(modValue) || 0;
    if (amount <= 0) return;
    
    const effectiveMax = getEffectiveMax();
    const newCurrent = Math.min(currentHp + amount, effectiveMax);
    
    commitChanges(newCurrent, parseInt(editTemp) || 0, editMax === '' ? null : parseInt(editMax) || null);
  };

  const handleDamage = () => {
    const amount = parseInt(modValue) || 0;
    if (amount <= 0) return;
    
    let currentTemp = parseInt(editTemp) || 0;
    let newCurrent = currentHp;
    
    if (currentTemp >= amount) {
      currentTemp -= amount;
    } else {
      const remainder = amount - currentTemp;
      currentTemp = 0;
      newCurrent = Math.max(0, newCurrent - remainder);
    }
    
    commitChanges(newCurrent, currentTemp, editMax === '' ? null : parseInt(editMax) || null);
  };

  const handleApplyState = () => {
     commitChanges(currentHp, parseInt(editTemp) || 0, editMax === '' ? null : parseInt(editMax) || null);
  };

  const commitChanges = (cHp, tHp, mOverride) => {
    onSave({
      current: cHp,
      temp: tHp,
      maxOverride: mOverride
    });
    setModValue('');
    onClose();
  };

  const currentMax = getEffectiveMax();
  const currentTotal = currentHp + (parseInt(editTemp) || 0);

  return (
    <>
      <div className="fixed inset-0 z-[190]" onClick={(e) => { e.stopPropagation(); onClose(); }}></div>
      
      <div 
        ref={modalRef}
        className="absolute left-full top-0 ml-4 z-[200] w-[168px] border border-tertiary bg-[#0D1216] flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.8)] transition-transform duration-100"
      >
        
        <div className="p-4 flex flex-col gap-4">
          
          {/* Row 1: Heal / Damage */}
          <div className="flex items-center justify-center gap-2">
            <button 
              onClick={handleHeal}
              className="group w-10 h-10 shrink-0 flex items-center justify-center bg-[#1df283] text-black rounded-md [box-shadow:0_0_8px_rgba(29,242,131,0.3),inset_0_0_8px_rgba(29,242,131,0.3)] transition-all duration-200 focus:outline-none cursor-pointer hover:[box-shadow:0_0_12px_rgba(29,242,131,0.5),inset_0_0_12px_rgba(29,242,131,0.5)] hover:bg-[#28eb85]"
            >
              <span className="material-symbols-outlined font-bold text-[20px] [font-variation-settings:'wght'_700] drop-shadow-[0_0_4px_rgba(0,0,0,0.2)] group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.4)]">add</span>
            </button>
            
            <input 
              type="number" 
              value={modValue}
              onChange={(e) => setModValue(e.target.value)}
              placeholder="0"
              className="w-10 h-10 shrink-0 flex items-center justify-center bg-transparent border-2 border-primary text-primary rounded-md [box-shadow:0_0_6px_rgba(87,230,239,0.2),inset_0_0_6px_rgba(87,230,239,0.2)] text-base font-[700] font-headline text-center p-0 transition-all duration-200 outline-none hover:[box-shadow:0_0_10px_rgba(87,230,239,0.4),inset_0_0_10px_rgba(87,230,239,0.4)] hover:bg-primary/10 focus:[box-shadow:0_0_14px_rgba(87,230,239,0.6),inset_0_0_14px_rgba(87,230,239,0.6)] hide-arrows"
              onKeyDown={(e) => {
                 if (e.key === 'Enter') handleDamage();
              }}
              autoFocus
            />
            
            <button 
              onClick={handleDamage}
              className="group w-10 h-10 shrink-0 flex items-center justify-center bg-secondary text-black rounded-md [box-shadow:0_0_8px_rgba(239,87,78,0.3),inset_0_0_8px_rgba(239,87,78,0.3)] transition-all duration-200 focus:outline-none cursor-pointer hover:[box-shadow:0_0_12px_rgba(239,87,78,0.5),inset_0_0_12px_rgba(239,87,78,0.5)] hover:bg-[#f26a61]"
            >
              <span className="material-symbols-outlined font-bold text-[20px] [font-variation-settings:'wght'_700] drop-shadow-[0_0_4px_rgba(0,0,0,0.2)] group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.4)]">remove</span>
            </button>
          </div>
          
          <div className="h-px bg-tertiary/30 w-full my-0"></div>

          {/* Row 2: Overrides */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1 text-center">
              <label className="text-[9px] text-secondary font-bold uppercase tracking-wider">Temp</label>
              <input 
                type="number" 
                value={editTemp}
                onChange={(e) => setEditTemp(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent border-b-[2px] border-primary/40 focus:border-primary outline-none text-primary pb-1 text-center font-label hide-arrows transition-colors"
                onBlur={handleApplyState}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyState()}
              />
            </div>
            
            <div className="flex flex-col gap-1 text-center">
              <label className="text-[9px] text-secondary font-bold uppercase tracking-wider">Max</label>
              <input 
                type="number" 
                value={editMax}
                onChange={(e) => setEditMax(e.target.value)}
                placeholder={finalMaxHp}
                className="w-full bg-transparent border-b-[2px] border-primary/40 focus:border-primary outline-none text-primary pb-1 text-center font-label hide-arrows transition-colors"
                onBlur={handleApplyState}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyState()}
              />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
