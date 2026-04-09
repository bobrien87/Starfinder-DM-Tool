import React, { useState, useRef, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import StatPill from './StatPill';

export default function InlineTraitValueEditor({ 
    values = [], 
    collectionName, 
    entityId, 
    fieldPath, 
    isEditing, 
    options = [],
    onSaveValue = null
}) {
    const { updateEntity } = useDatabase();
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    const parseTrait = (str) => {
        if (typeof str !== 'string') return { type: str?.type || '', value: str?.value || '', category: 'none' };
        
        let cleanStr = str.trim();
        let isDist = false;
        if (cleanStr.toLowerCase().endsWith('ft') || cleanStr.toLowerCase().endsWith('ft.')) {
            cleanStr = cleanStr.replace(/ft\.?$/i, '').trim();
            isDist = true;
        }

        const DISTANCE_TRAITS = ['reach', 'thrown', 'volley', 'range', 'burst', 'emanation', 'cone', 'line', 'aura', 'scatter'];
        const NUMBER_TRAITS = ['reload', 'capacity', 'usage', 'charge', 'magazine'];
        const STRING_TRAITS = ['deadly', 'fatal', 'versatile', 'modular'];

        const parts = cleanStr.split(' ');
        if (parts.length > 1) {
            const lastWord = parts[parts.length - 1];
            const isNumeric = !isNaN(parseInt(lastWord, 10)); 
            const isDice = /^d\d+$/i.test(lastWord); 
            const isLetter = /^[P|S|B|E|F|C|A](?:\/[P|S|B|E|F|C|A])*$/i.test(lastWord); 

            const lowerType = parts.slice(0, parts.length - 1).join(' ').toLowerCase();
            let forceCategory = null;
            if (DISTANCE_TRAITS.some(t => lowerType.includes(t))) forceCategory = 'distance';
            else if (NUMBER_TRAITS.some(t => lowerType.includes(t))) forceCategory = 'number';
            else if (STRING_TRAITS.some(t => lowerType.includes(t))) forceCategory = 'string';

            if (forceCategory || isNumeric || isDice || isLetter || isDist) {
                return {
                    type: parts.slice(0, parts.length - 1).join(' '),
                    value: lastWord,
                    category: forceCategory || (isDist ? 'distance' : (isNumeric ? 'number' : 'string'))
                };
            }
        }

        const singleLower = cleanStr.toLowerCase();
        let cat = 'none';
        if (DISTANCE_TRAITS.some(t => singleLower.includes(t))) cat = 'distance';
        else if (NUMBER_TRAITS.some(t => singleLower.includes(t))) cat = 'number';
        else if (STRING_TRAITS.some(t => singleLower.includes(t))) cat = 'string';

        return { type: cleanStr, value: '', category: cat };
    };

    const rawValues = values || [];
    const safeValues = rawValues.map(v => parseTrait(v));

    // Compute dropdown matches
    const filteredAvailable = options.filter(t => 
        t.toLowerCase().includes(inputValue.toLowerCase()) && 
        !safeValues.some(v => v.type.toLowerCase() === t.toLowerCase())
    );

    const handleChangeArray = (newObjArray) => {
        // Flatten back down to string array for universal app compatibility
        const strArray = newObjArray.map(obj => {
            let str = obj.type;
            if (obj.value && obj.value !== '') {
                str += ` ${obj.value}`;
                if (obj.category === 'distance') str += ' ft';
            }
            return str;
        });

        if (onSaveValue) {
            onSaveValue(strArray);
        } else {
            updateEntity(collectionName, entityId, { [fieldPath]: strArray });
        }
    };

    const handleSelect = (traitRaw) => {
        // Pass it through parser to get category right
        handleChangeArray([...safeValues, parseTrait(traitRaw)]);
        setInputValue('');
        inputRef.current?.focus();
    };

    const handleRemove = (traitType) => {
        handleChangeArray(safeValues.filter(t => t.type !== traitType));
    };

    const handleValueChange = (traitType, newValue) => {
        handleChangeArray(safeValues.map(t => t.type === traitType ? { ...t, value: newValue } : t));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' && inputValue === '' && safeValues.length > 0) {
            const newArray = [...safeValues];
            newArray.pop();
            handleChangeArray(newArray);
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
        if (safeValues.length === 0) return null;
        return (
            <div className="flex gap-1 flex-wrap">
                {safeValues.map(v => {
                    let text = v.type;
                    if (v.value && v.value !== '') {
                        text += ` ${v.value}`;
                        if (v.category === 'distance') text += ' ft';
                    }
                    return <StatPill key={v.type}>{text}</StatPill>;
                })}
            </div>
        );
    }

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div 
                className={`flex flex-wrap items-center min-h-[32px] gap-1 cursor-text transition-colors w-full relative z-20 bg-surface-container-lowest border px-2 py-1 rounded ${isFocused ? 'border-primary/50 shadow-sm shadow-primary/20' : 'border-outline-variant/30'}`}
                onClick={() => {
                    inputRef.current?.focus();
                    setIsFocused(true);
                }}
            >
                {/* Active Editable Pills */}
                {safeValues.map(v => {
                    return (
                        <StatPill key={v.type} variant="edit" className="select-none group">
                            {v.type}
                            {v.category !== 'none' && (
                                <>
                                    <input
                                        type={v.category === 'string' ? "text" : "number"}
                                        value={v.value}
                                        onChange={(e) => handleValueChange(v.type, e.target.value)}
                                        className="bg-surface-container-lowest border border-outline-variant/30 text-center w-8 text-[10px] h-4 ml-1 focus:border-primary/50 outline-none p-0 hide-arrows"
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder={v.category === 'distance' ? "ft" : (v.category === 'string' ? "d8" : "0")}
                                    />
                                    {v.category === 'distance' && <span className="text-[9px] font-normal opacity-70 ml-0.5">ft</span>}
                                </>
                            )}
                            <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); handleRemove(v.type); }} 
                                className="text-secondary/50 hover:text-error transition-colors flex items-center justify-center -mr-1 ml-1"
                            >
                                <span className="material-symbols-outlined text-[12px]">close</span>
                            </button>
                        </StatPill>
                    );
                })}
                
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
                    placeholder="+ Trait"
                    className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-xs text-primary h-6"
                />
            </div>

            {/* Dropdown Options */}
            {isFocused && (filteredAvailable.length > 0 || inputValue.length > 0) && (
                <div className="absolute top-full mt-1 left-0 w-full max-h-48 overflow-y-auto bg-surface-container border border-primary/30 shadow-lg z-50">
                    {filteredAvailable.length > 0 ? (
                        filteredAvailable.map(opt => (
                            <div 
                                key={opt}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(opt);
                                }}
                                className="px-3 py-2 text-xs text-secondary hover:bg-primary/20 hover:text-primary cursor-pointer border-b border-outline-variant/10 uppercase tracking-widest font-label font-bold"
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
