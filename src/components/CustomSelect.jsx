import React, { useState, useRef, useEffect } from 'react';

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
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div 
                className={`flex items-center justify-between min-h-[32px] px-3 py-1 cursor-pointer transition-colors w-full relative z-20 ${isOpen ? 'border-primary/50' : 'border-outline-variant/30'} border bg-surface-container-lowest text-xs text-primary`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`block truncate text-[10px] font-bold font-label uppercase tracking-widest ${!value ? 'opacity-70' : ''}`}>
                    {selectedOption.label}
                </span>
                <span className={`material-symbols-outlined text-[16px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    arrow_drop_down
                </span>
            </div>

            {isOpen && (
                <div className="absolute top-full mt-1 left-0 w-full max-h-48 overflow-y-auto bg-surface-container border border-primary/30 shadow-lg z-50">
                    {options.map(opt => (
                        <div 
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={`px-3 py-2 text-xs cursor-pointer border-b border-outline-variant/10 uppercase tracking-widest font-label font-bold transition-colors ${
                                opt.value === value 
                                    ? 'bg-primary/20 text-primary' 
                                    : 'text-secondary hover:bg-primary/10 hover:text-primary'
                            }`}
                        >
                            {opt.label}
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div className="px-3 py-2 text-xs text-outline-variant italic">No options available.</div>
                    )}
                </div>
            )}
        </div>
    );
}
