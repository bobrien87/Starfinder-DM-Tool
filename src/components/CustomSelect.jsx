import React, { useState, useRef, useEffect } from 'react';
import BaseComboSelect from './BaseComboSelect';

export default function CustomSelect({ value, onChange, options, placeholder = "Select...", className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || { label: placeholder, value: '' };

  return (
    <BaseComboSelect
      wrapperRef={wrapperRef}
      isFocused={isOpen}
      onClickWrapper={() => setIsOpen(!isOpen)}
      containerClassName={`relative ${className}`}
      inputClassName="flex items-center justify-between min-h-[32px] px-3 py-1 cursor-pointer transition-colors w-full z-20 border text-xs text-off-white"
      dropdownContent={isOpen ? (
        <>
          {options.map(opt => (
            <div 
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-xs cursor-pointer border-b border-outline-variant/10 tracking-widest font-label transition-colors ${
                opt.value === value 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-primary hover:bg-primary/10'
              }`}
            >
              {opt.label}
            </div>
          ))}
          {options.length === 0 && (
            <div className="px-3 py-2 text-xs text-outline-variant italic">No options available.</div>
          )}
        </>
      ) : null}
    >
      <span className={`block truncate text-[12px] font-label tracking-widest ${!value ? 'opacity-70' : ''}`}>
        {selectedOption.label}
      </span>
      <span className={`material-symbols-outlined text-[16px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
        arrow_drop_down
      </span>
    </BaseComboSelect>
  );
}
