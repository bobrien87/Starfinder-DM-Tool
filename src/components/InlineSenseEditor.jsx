import React, { useState, useRef, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import StatPill from './StatPill';

export default function InlineSenseEditor({ 
  values = [], 
  collectionName, 
  entityId, 
  fieldPath, 
  isEditing, 
  options = [],
  hideNone = false
}) {
  const { updateEntity } = useDatabase();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  const rawValues = values || [];
  const safeValues = rawValues.map(v => {
    if (typeof v === 'string') {
      const parts = v.trim().split(' ');
      const val = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(val)) {
        return { type: parts.slice(0, -1).join(' '), value: val };
      }
      return { type: v, value: 0 };
    }
    return v;
  });

  // Compute dropdown matches
  const filteredAvailable = options.filter(t => 
    t.toLowerCase().includes(inputValue.toLowerCase()) && 
    !safeValues.some(v => v.type.toLowerCase() === t.toLowerCase())
  );

  const handleChange = (newObjArray) => {
    updateEntity(collectionName, entityId, { [fieldPath]: newObjArray });
  };

  const handleSelect = (traitRaw) => {
    // Add with a default value of 0 (meaning no explicit range specified)
    handleChange([...safeValues, { type: traitRaw, value: 0 }]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleRemove = (traitType) => {
    handleChange(safeValues.filter(t => t.type !== traitType));
  };

  const handleValueChange = (traitType, newValue) => {
    const parsed = parseInt(newValue, 10);
    const valToSave = isNaN(parsed) ? 0 : parsed;
    handleChange(safeValues.map(t => t.type === traitType ? { ...t, value: valToSave } : t));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && inputValue === '' && safeValues.length > 0) {
      const newArray = [...safeValues];
      newArray.pop();
      handleChange(newArray);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val === '') return;

      const exactMatch = filteredAvailable.find(t => t.toLowerCase() === val.toLowerCase());
      if (exactMatch) {
        handleSelect(exactMatch);
      } else {
        if (!safeValues.some(v => v.type.toLowerCase() === val.toLowerCase())) {
          handleSelect(val);
        } else {
          setInputValue('');
        }
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
        setInputValue('');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [safeValues]);

  if (!isEditing) {
    if (safeValues.length === 0) return hideNone ? null : <span className="text-xs text-outline-variant italic">None</span>;
    return (
      <div className="flex gap-1 flex-wrap">
        {safeValues.map(v => (
          <StatPill key={v.type}>
            {v.type}{v.value > 0 ? ` ${v.value} ft` : ''}
          </StatPill>
        ))}
      </div>
    );
  }

  // Edit Mode Base Styling
 const editPillClass = "inline-flex items-center gap-1 border border-primary/30 px-2 py-0.5 text-[9px] font-label tracking-widest text-primary shadow-sm";

  return (
    <div ref={wrapperRef} className="relative w-full mb-3">
      <div 
        className={`border ${isFocused ? 'border-primary/50' : 'border-outline-variant/30'} flex flex-wrap items-center min-h-[32px] px-2 py-1 gap-1 cursor-text transition-colors w-full relative z-20`}
        onClick={() => {
          inputRef.current?.focus();
          setIsFocused(true);
        }}
      >
        {/* Active Editable Pills */}
        {safeValues.map(v => (
          <StatPill key={v.type} variant="edit" className="select-none group">
            {v.type}
            <input
              type="number"
              value={v.value === 0 ? '' : v.value}
              onChange={(e) => handleValueChange(v.type, e.target.value)}
              className="border border-outline-variant/30 text-center w-8 text-[12px] h-4 ml-1 focus:border-primary/50 outline-none p-0 hide-arrows"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-[9px] font-normal opacity-70 ml-0.5">ft</span>
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); handleRemove(v.type); }} 
              className="text-primary/50 hover:text-accent-yellow transition-colors flex items-center justify-center -mr-1 ml-1"
            >
              <span className="material-symbols-outlined text-[12px]">close</span>
            </button>
          </StatPill>
        ))}
        
        {/* Input Field */}
        <input 
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsFocused(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={safeValues.length === 0 ? "Add sense..." : ""}
          className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-xs text-primary h-6"
        />
      </div>

      {/* Dropdown Options */}
      {isFocused && (filteredAvailable.length > 0 || inputValue.length > 0) && (
        <div className="absolute top-full mt-1 left-0 w-full max-h-48 overflow-y-auto border-2 border-x-primary/30 border-b-primary/30 shadow-lg z-50 bg-[#12111A]" style={{ borderTopColor: 'rgba(87, 230, 239, 0.05)' }}>
          {filteredAvailable.length > 0 ? (
            filteredAvailable.map(opt => (
              <div 
                key={opt}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(opt);
                }}
        className="px-3 py-2 text-xs text-primary hover:bg-primary/20 hover:text-primary cursor-pointer border-b tracking-widest font-label border-tertiary/30"
              >
                {opt}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-outline-variant italic">No exact match. (Press Enter to add custom type)</div>
          )}
        </div>
      )}
    </div>
  );
}
