import React, { useState, useRef, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useDice } from '../context/DiceContext';
import StatPill from './StatPill';

export default function InlineSkillEditor({ 
    skills = {}, 
    collectionName, 
    entityId, 
    isEditing, 
    options = [],
    formatMod
}) {
    const { updateEntity } = useDatabase();
    const { rollDice } = useDice();
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    // Provide safety net and convert from object dictionary { "Acrobatics": 5 } to array [{type: "Acrobatics", value: 5}]
    const safeSkills = skills || {};
    const skillList = Object.entries(safeSkills).map(([type, value]) => ({ type, value }));

    // Compute dropdown matches ignoring already added skills
    const filteredAvailable = options.filter(t => 
        t.toLowerCase().includes(inputValue.toLowerCase()) && 
        !(t in safeSkills)
    );

    const handleChange = (newMap) => {
        updateEntity(collectionName, entityId, { skills: newMap });
    };

    const handleSelect = (skillRaw) => {
        // Add skill with default modifier of 0
        handleChange({ ...safeSkills, [skillRaw]: 0 });
        setInputValue('');
        inputRef.current?.focus();
    };

    const handleRemove = (skillType) => {
        const newMap = { ...safeSkills };
        delete newMap[skillType];
        handleChange(newMap);
    };

    const handleValueChange = (skillType, newValue) => {
        const parsed = parseInt(newValue, 10);
        const valToSave = isNaN(parsed) ? 0 : parsed;
        handleChange({ ...safeSkills, [skillType]: valToSave });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' && inputValue === '' && skillList.length > 0) {
            // Remove last added skill for fast cleanup
            const lastSkill = skillList[skillList.length - 1].type;
            handleRemove(lastSkill);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const val = inputValue.trim();
            if (val === '') return;

            const exactMatch = filteredAvailable.find(t => t.toLowerCase() === val.toLowerCase());
            if (exactMatch) {
                handleSelect(exactMatch);
            } else {
                if (!(val in safeSkills)) {
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
    }, [safeSkills]);

    if (!isEditing) {
        if (skillList.length === 0) return <span className="text-xs text-outline-variant italic">No skills documented.</span>;
        return (
            <div className="flex gap-1 flex-wrap">
                {skillList.map(v => (
                    <StatPill key={v.type} label={v.type} onClick={() => rollDice(v.type, v.value)}>
                        {formatMod(v.value)}
                    </StatPill>
                ))}
            </div>
        );
    }

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div 
                className={`bg-surface-container-lowest border ${isFocused ? 'border-primary/50' : 'border-outline-variant/30'} flex flex-wrap items-center min-h-[32px] px-2 py-1 gap-1 cursor-text transition-colors w-full relative z-20`}
                onClick={() => {
                    inputRef.current?.focus();
                    setIsFocused(true);
                }}
            >
                {/* Active Editable Pills */}
                {skillList.map(v => (
                    <StatPill key={v.type} variant="edit" className="select-none group !gap-0.5">
                        {v.type}
                        <div className="flex items-center ml-1 bg-surface-container-lowest border border-outline-variant/30 pl-1 hide-arrows focus-within:border-primary/50 transition-colors">
                            <span className="text-primary text-[10px] font-bold select-none">{v.value >= 0 ? '+' : ''}</span>
                            <input
                                type="number"
                                value={v.value === 0 ? '' : v.value}
                                onChange={(e) => handleValueChange(v.type, e.target.value)}
                                className="bg-transparent text-left w-6 text-[10px] h-4 outline-none p-0 hide-arrows ml-[1px]"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); handleRemove(v.type); }} 
                            className="text-secondary/50 hover:text-error transition-colors flex items-center justify-center -mr-1 ml-1"
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
                    placeholder={skillList.length === 0 ? "Add skill..." : ""}
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
                        <div className="px-3 py-2 text-xs text-outline-variant italic">No exact match. (Press Enter to add custom skill)</div>
                    )}
                </div>
            )}
        </div>
    );
}
