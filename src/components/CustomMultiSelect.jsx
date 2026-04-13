import React, { useState, useRef, useEffect } from 'react';
import BaseComboSelect from './BaseComboSelect';

export default function CustomMultiSelect({ 
  value = [], 
  onChange, 
  options = [],
  placeholder = "Select..."
}) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Compute dropdown matches
  const filteredAvailable = options.filter(t => 
    t.toLowerCase().includes(inputValue.toLowerCase()) && 
    !value.includes(t)
  );

  const handleSelect = (trait) => {
    onChange([...value, trait]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleRemove = (trait) => {
    onChange(value.filter(t => t !== trait));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // Remove the last selected trait
      const newTraits = [...value];
      newTraits.pop();
      onChange(newTraits);
    } else if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      const val = inputValue.trim();
      if (val === '') return;

      // Try exact match first
      const exactMatch = filteredAvailable.find(t => t.toLowerCase() === val.toLowerCase());
      if (exactMatch) {
        handleSelect(exactMatch);
      } else {
        // If it's a custom string not in the options array
        if (!value.includes(val)) {
          handleSelect(val);
        } else {
          setInputValue(''); // Clear if duplicate
        }
      }
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
        if (inputRef.current) {
          const pendingVal = inputRef.current.value.trim();
          if (pendingVal && !value.includes(pendingVal)) {
            // Optionally, auto-save pending text on blur? 
            // Disabling for now: better to strictly require Enter for intent.
          }
        }
        setInputValue('');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  return (
    <BaseComboSelect
      wrapperRef={wrapperRef}
      isFocused={isFocused}
      onClickWrapper={() => {
        inputRef.current?.focus();
        setIsFocused(true);
      }}
      dropdownContent={isFocused && (filteredAvailable.length > 0 || inputValue.length > 0) ? (
        <>
          {filteredAvailable.length > 0 ? (
            filteredAvailable.map(opt => (
              <div 
                key={opt}
                onClick={() => handleSelect(opt)}
                className="px-3 py-2 text-xs text-primary hover:bg-primary/20 hover:text-primary cursor-pointer border-b tracking-widest font-label border-tertiary/30"
              >
                {opt}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-outline-variant italic">No exact match in options. (Press Enter to add custom value)</div>
          )}
        </>
      ) : null}
    >
      {/* Selected Chips */}
      {value.map(val => (
        <div key={val} className="inline-flex items-center gap-1 border border-outline-variant/50 px-2 py-0.5 text-[12px] font-label tracking-widest text-off-white group shadow-sm select-none">
          {val}
          <button 
            type="button" 
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(val);
            }} 
            className="text-primary/50 hover:text-accent-yellow transition-colors flex items-center justify-center -mr-1"
          >
            <span className="material-symbols-outlined text-[12px]">close</span>
          </button>
        </div>
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
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-xs text-off-white h-6"
      />
    </BaseComboSelect>
  );
}
