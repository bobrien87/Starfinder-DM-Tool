import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';

export default function InlineEditable({ 
    value, 
    collectionName, 
    entityId, 
    fieldPath, 
    isEditing, 
    type = 'text', 
    className = '',
    useFormatMod = false, // Whether to parse numbers with explicit +/- prefix on display
    onSave = null // If provided, overrides the default Firebase updateEntity behavior
}) {
    const { updateEntity } = useDatabase();
    const [localValue, setLocalValue] = useState(value);

    // Sync local state down from Firestore whenever the stream updates
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleBlur = async () => {
        if (localValue !== value) {
            let finalValue = localValue;
            if (type === 'number') {
                finalValue = finalValue === '' ? 0 : Number(finalValue);
            }
            try {
               if (onSave) {
                   await onSave(finalValue);
               } else {
                   await updateEntity(collectionName, entityId, { [fieldPath]: finalValue });
               }
            } catch (err) {
               console.error("Failed to inline update:", err);
               setLocalValue(value); // Revert on failure
            }
        }
    };

    // Helper for formatting modifiers (+4, -2) gracefully
    const getFormattedValue = () => {
        if (value === undefined || value === null) return '';
        if (useFormatMod) {
           const num = Number(value);
           if (isNaN(num)) return value;
           return num >= 0 ? `+${num}` : num;
        }
        return value;
    };

    if (!isEditing) {
        return <span className={className}>{getFormattedValue()}</span>;
    }

    const alignClass = type === 'number' ? 'text-center' : 'text-left';

    return (
        <input 
            type={type}
            className={`bg-transparent outline-none border-b-[2px] border-primary/40 focus:border-primary min-w-[30px] w-full ${alignClass} ${className}`}
            value={localValue === undefined || localValue === null ? '' : localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} // Allows quick submit
            onClick={(e) => e.stopPropagation()} // Stop bubbling to rollDice blocks
        />
    );
}
