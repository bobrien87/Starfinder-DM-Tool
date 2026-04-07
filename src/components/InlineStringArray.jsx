import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';

export default function InlineStringArray({ 
    values = [], 
    collectionName, 
    entityId, 
    fieldPath, 
    isEditing,
    pillClass = "px-2 py-0.5 bg-primary/20 border border-primary/30 text-[10px] font-bold font-label text-primary uppercase",
    options = null, // If provided, renders a dropdown instead of typed text
    onSaveValue = null // If provided, overrides default Firebase updateEntity behavior
}) {
    const { updateEntity } = useDatabase();
    const [newValue, setNewValue] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const safeValues = values || [];

    const handleRemove = async (indexToRemove) => {
        const newArray = safeValues.filter((_, i) => i !== indexToRemove);
        try {
            if (onSaveValue) { await onSaveValue(newArray); }
            else { await updateEntity(collectionName, entityId, { [fieldPath]: newArray }); }
        } catch (err) {
            console.error("Failed to remove array string:", err);
        }
    };

    const handleAdd = async (overrideValue = null) => {
        const valToSave = overrideValue || newValue.trim();
        if (!valToSave || safeValues.includes(valToSave)) {
            setIsAdding(false);
            setNewValue("");
            return;
        }
        const newArray = [...safeValues, valToSave];
        try {
            if (onSaveValue) { await onSaveValue(newArray); }
            else { await updateEntity(collectionName, entityId, { [fieldPath]: newArray }); }
        } catch (err) {
            console.error("Failed to add array string:", err);
        }
        setNewValue("");
        setIsAdding(false);
    };

    if (!isEditing && safeValues.length === 0) {
       return <span className={`${pillClass} opacity-50`}>None</span>;
    }

    return (
        <div className="flex flex-wrap gap-2 items-center">
            {safeValues.map((val, idx) => (
                <span key={`${val}-${idx}`} className={`${pillClass} flex items-center gap-1`}>
                    {val}
                    {isEditing && (
                        <button onClick={() => handleRemove(idx)} className="hover:text-red-400 font-bold ml-1 leading-none focus:outline-none">
                            ×
                        </button>
                    )}
                </span>
            ))}
            
            {isEditing && (
                isAdding ? (
                    options ? (
                        <select 
                            autoFocus
                            value={newValue}
                            onChange={(e) => {
                                if (e.target.value) handleAdd(e.target.value);
                            }}
                            onBlur={() => setIsAdding(false)}
                            className={`${pillClass} outline-none bg-surface border-primary cursor-pointer`}
                        >
                            <option value="">Select...</option>
                            {options.filter(o => !safeValues.includes(o)).map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : (
                        <input 
                            autoFocus
                            type="text" 
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            onBlur={() => handleAdd()}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            className={`${pillClass} outline-none bg-black/40 border-primary !min-w-[60px]`}
                            placeholder="Add..."
                        />
                    )
                ) : (
                    <button onClick={() => setIsAdding(true)} className={`${pillClass} hover:bg-primary/40 cursor-pointer opacity-70`}>
                        + Add
                    </button>
                )
            )}
        </div>
    );
}
