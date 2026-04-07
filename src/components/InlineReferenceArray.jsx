import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';

export default function InlineReferenceArray({ 
    values = [], 
    collectionName, 
    entityId, 
    fieldPath, 
    isEditing,
    referenceCollection = 'items', // expects 'items', 'spells', etc.
    pillClass = "px-2 py-0.5 bg-surface-container-lowest border border-outline-variant/10 text-[10px] text-secondary",
    onSaveValue = null // Override for nested array protection
}) {
    const { updateEntity, getEntity, items, spells } = useDatabase();
    const [isAdding, setIsAdding] = useState(false);

    // Dynamically pull from the actively cached global context mapped inside DatabaseContext
    let optionsSource = [];
    if (referenceCollection === 'items') optionsSource = items || [];
    if (referenceCollection === 'spells') optionsSource = spells || [];

    // Auto-heal logic
    const safeValues = Array.isArray(values) ? values : Object.values(values || {});

    // Hide options already selected
    const availableOptions = optionsSource.filter(opt => !safeValues.includes(opt.id))
        .sort((a,b) => a.name.localeCompare(b.name));

    const handleRemove = async (indexToRemove) => {
        const newArray = safeValues.filter((_, i) => i !== indexToRemove);
        try {
            if (onSaveValue) { await onSaveValue(newArray); }
            else { await updateEntity(collectionName, entityId, { [fieldPath]: newArray }); }
        } catch (err) {
            console.error("Failed to remove bound reference", err);
        }
    };

    const handleAdd = async (newId) => {
        if (!newId) return;
        const newArray = [...safeValues, newId];
        try {
            if (onSaveValue) { await onSaveValue(newArray); }
            else { await updateEntity(collectionName, entityId, { [fieldPath]: newArray }); }
        } catch (err) {
            console.error("Failed to append bound reference", err);
        }
        setIsAdding(false);
    };

    if (!isEditing && safeValues.length === 0) {
       return <span className="text-[10px] text-outline-variant">No items documented.</span>;
    }

    return (
        <div className="flex flex-wrap gap-1 items-center">
            {safeValues.map((refId, idx) => {
                const def = getEntity(referenceCollection, refId);
                const displayName = def ? def.name : refId;
                
                return (
                    <span key={`${refId}-${idx}`} className={`${pillClass} flex items-center gap-1`}>
                        {displayName}
                        {isEditing && (
                            <button onClick={() => handleRemove(idx)} className="hover:text-red-400 font-bold ml-1 leading-none text-red-500/50">
                                ×
                            </button>
                        )}
                    </span>
                );
            })}
            
            {isEditing && (
                isAdding ? (
                    <select 
                        autoFocus
                        onChange={(e) => {
                            if (e.target.value) handleAdd(e.target.value);
                            else setIsAdding(false);
                        }}
                        onBlur={() => setIsAdding(false)}
                        className={`${pillClass} outline-none bg-surface border-primary cursor-pointer max-w-[200px] text-primary`}
                        defaultValue=""
                    >
                        <option value="">Select {referenceCollection.slice(0, -1)}...</option>
                        {availableOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                    </select>
                ) : (
                    <button onClick={() => setIsAdding(true)} className={`${pillClass} hover:bg-primary/40 cursor-pointer opacity-70`}>
                        + Add Formatted Data
                    </button>
                )
            )}
        </div>
    );
}
