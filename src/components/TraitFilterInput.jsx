import React, { useState, useRef, useEffect } from 'react';

export default function TraitFilterInput({ selectedTraits, onChange, availableTraits }) {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    // Compute dropdown matches
    const filteredAvailable = availableTraits.filter(t => 
        t.toLowerCase().includes(inputValue.toLowerCase()) && 
        !selectedTraits.includes(t)
    );

    const handleSelect = (trait) => {
        onChange([...selectedTraits, trait]);
        setInputValue('');
        inputRef.current?.focus();
    };

    const handleRemove = (trait) => {
        onChange(selectedTraits.filter(t => t !== trait));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' && inputValue === '' && selectedTraits.length > 0) {
            // Remove the last selected trait
            const newTraits = [...selectedTraits];
            newTraits.pop();
            onChange(newTraits);
        } else if (e.key === 'Enter' && filteredAvailable.length > 0) {
            // Select the exact match or first match
            const exactMatch = filteredAvailable.find(t => t.toLowerCase() === inputValue.toLowerCase());
            if (exactMatch) handleSelect(exactMatch);
            else handleSelect(filteredAvailable[0]);
        }
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div 
                className={`bg-surface-container-lowest border ${isFocused ? 'border-primary/50' : 'border-outline-variant/30'} flex flex-wrap items-center min-h-[32px] px-2 py-1 gap-1 cursor-text transition-colors w-full relative z-20`}
                onClick={() => {
                    inputRef.current?.focus();
                    setIsFocused(true);
                }}
            >
                {/* Selected Chips */}
                {selectedTraits.map(trait => (
                    <div key={trait} className="inline-flex items-center gap-1 bg-surface-container-high border border-outline-variant/50 px-2 py-0.5 text-[10px] font-bold font-label uppercase tracking-widest text-primary group shadow-sm select-none">
                        {trait}
                        <button 
                            type="button" 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(trait);
                            }} 
                            className="text-secondary/50 hover:text-error transition-colors flex items-center justify-center -mr-1"
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
                    placeholder={selectedTraits.length === 0 ? "e.g. humanoid, swarm..." : ""}
                    className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-xs text-primary h-6"
                />
            </div>

            {/* Dropdown Menu */}
            {isFocused && (filteredAvailable.length > 0 || inputValue.length > 0) && (
                <div className="absolute top-full mt-1 left-0 w-full max-h-48 overflow-y-auto bg-surface-container border border-primary/30 shadow-lg z-50">
                    {filteredAvailable.length > 0 ? (
                        filteredAvailable.map(trait => (
                            <div 
                                key={trait}
                                onClick={() => handleSelect(trait)}
                                className="px-3 py-2 text-xs text-secondary hover:bg-primary/20 hover:text-primary cursor-pointer border-b border-outline-variant/10 uppercase tracking-widest font-label font-bold"
                            >
                                {trait}
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-xs text-outline-variant italic">No exact traits found. (Press Enter to add anyway)</div>
                    )}
                </div>
            )}
        </div>
    );
}
