import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';

export default function InlineEditableTextarea({ 
    value, 
    collectionName, 
    entityId, 
    fieldPath, 
    isEditing, 
    className = '',
    onSave = null
}) {
    const { updateEntity } = useDatabase();
    const [localValue, setLocalValue] = useState(value);

    // Sync local state down from Firestore whenever the stream updates
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleBlur = async () => {
        if (localValue !== value) {
            try {
               if (onSave) {
                   await onSave(localValue);
               } else {
                   await updateEntity(collectionName, entityId, { [fieldPath]: localValue });
               }
            } catch (err) {
               console.error("Failed to inline update textarea:", err);
               setLocalValue(value);
            }
        }
    };

    if (!isEditing) {
        return <p className={className}>{value}</p>;
    }

    return (
        <textarea 
            className={`bg-transparent outline-none border-b-[2px] border-primary/40 focus:border-primary w-full resize-y min-h-[60px] ${className}`}
            value={localValue || ''}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onClick={(e) => e.stopPropagation()} // Stop bubbling
        />
    );
}
